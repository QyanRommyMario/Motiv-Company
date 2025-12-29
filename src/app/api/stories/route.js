import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import supabase from "@/lib/prisma";
import {
  handleApiError,
  requireAuth,
  validateRequest,
} from "@/lib/apiErrorHandler";

// GET - Fetch all published stories (for public) or all stories (for admin)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Admin can see all stories, public only sees published
    let query = supabase
      .from("Story")
      .select("*")
      .order("order", { ascending: true });

    if (!isAdmin) {
      query = query.eq("isPublished", true);
    }

    const { data: stories, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, stories });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create new story (Admin only)
export async function POST(request) {
  try {
    // Check authentication
    const { session, error: authError } = await requireAuth(request, "ADMIN");
    if (authError) return authError;

    const data = await request.json();

    // Validate required fields
    validateRequest(data, ["title", "content"]);

    const { title, content, imageUrl, featuredImage, isPublished, order } =
      data;

    const { data: story, error } = await supabase
      .from("Story")
      .insert({
        title,
        content,
        featuredImage: featuredImage || imageUrl || null,
        isPublished: isPublished || false,
        order: order || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, story }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
