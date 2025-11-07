import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all published stories (for public) or all stories (for admin)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Admin can see all stories, public only sees published
    const stories = await prisma.story.findMany({
      where: isAdmin ? {} : { isPublished: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

// POST - Create new story (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, imageUrl, isPublished, order } =
      await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const story = await prisma.story.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        isPublished: isPublished || false,
        order: order || 0,
      },
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
