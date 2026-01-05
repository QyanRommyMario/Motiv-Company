import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch single story
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";
    const { id } = await params;

    const { data: story, error } = await supabase
      .from("Story")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (!story) {
      return NextResponse.json(
        { success: false, message: "Story not found" },
        { status: 404 }
      );
    }

    // Only allow unpublished stories for admin
    if (!story.isPublished && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, story });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

// PUT - Update story (Admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, imageUrl, featuredImage, isPublished, order } =
      await request.json();

    const { data: story, error } = await supabase
      .from("Story")
      .update({
        title,
        content,
        featuredImage: featuredImage || imageUrl,
        isPublished,
        order,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update story" },
      { status: 500 }
    );
  }
}

// DELETE - Delete story (Admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase.from("Story").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Story deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
