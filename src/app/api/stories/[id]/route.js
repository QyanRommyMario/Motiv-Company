import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch single story
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";
    const { id } = await params;

    const story = await prisma.story.findUnique({
      where: { id },
    });

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
    console.error("Error fetching story:", error);
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

    const story = await prisma.story.update({
      where: { id },
      data: {
        title,
        content,
        featuredImage: featuredImage || imageUrl, // Support both field names
        isPublished,
        order,
      },
    });

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Error updating story:", error);
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

    await prisma.story.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
