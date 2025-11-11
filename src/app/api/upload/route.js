import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "File size too large. Maximum 5MB allowed.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // VERCEL COMPATIBILITY: Use /tmp for serverless or public/uploads for local
    const isVercel = process.env.VERCEL === "1";
    const uploadsDir = isVercel
      ? join("/tmp", "uploads")
      : join(process.cwd(), "public", "uploads");

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // IMPORTANT: For Vercel, files in /tmp are temporary
    // Consider using cloud storage (Cloudinary, AWS S3, etc.) for production
    // For now, we'll warn the user
    if (isVercel) {
      console.warn(
        "⚠️  File uploaded to /tmp on Vercel - this is temporary! Consider using Cloudinary or S3."
      );
    }

    // Return public URL
    // NOTE: On Vercel, /tmp files are not publicly accessible
    // This is a limitation - you need cloud storage for production
    const publicUrl = isVercel
      ? `/api/uploads/${filename}` // We'll need to create API endpoint to serve from /tmp
      : `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrl,
      warning: isVercel
        ? "File is temporary on Vercel. Please configure cloud storage for production."
        : null,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
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
