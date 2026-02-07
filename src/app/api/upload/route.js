import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { uploadFileSchema } from "@/lib/validations";
import { uploadLimiter } from "@/lib/rateLimiter";
import logger from "@/lib/logger";
import { z } from "zod";

// Initialize Supabase client
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aaltkprawfanoajoevcp.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      logger.security("Unauthorized file upload attempt", {
        userId: session?.user?.id,
        ip: request.headers.get("x-forwarded-for"),
      });

      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    // Apply rate limiting (10 uploads per 5 minutes)
    const limitResponse = await uploadLimiter(request);
    if (limitResponse) return limitResponse;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file with schema
    try {
      uploadFileSchema.parse({
        type: file.type,
        size: file.size,
        name: file.name,
      });

      logger.info("File upload initiated", {
        adminId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("File upload validation failed", {
          adminId: session.user.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          errors: error.errors,
        });

        return NextResponse.json(
          {
            success: false,
            message: "File validation failed",
            errors: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("motiv-uploads") // Bucket name - create this in Supabase dashboard
      .upload(`images/${filename}`, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      logger.error("Supabase storage upload failed", error, {
        adminId: session.user.id,
        fileName: file.name,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Upload failed",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("motiv-uploads")
      .getPublicUrl(`images/${filename}`);

    logger.business("File uploaded successfully", {
      adminId: session.user.id,
      fileName: filename,
      originalName: file.name,
      url: publicUrlData.publicUrl,
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully to Supabase Storage",
      url: publicUrlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    logger.error("File upload failed", error, {
      adminId: session?.user?.id,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload file",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
