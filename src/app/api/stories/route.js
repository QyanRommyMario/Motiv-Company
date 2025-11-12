import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getPrismaClient,
  handleApiError,
  requireAuth,
  validateRequest,
} from "@/lib/apiErrorHandler";

// GET - Fetch all published stories (for public) or all stories (for admin)
export async function GET(request) {
  try {
    const prisma = await getPrismaClient();
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Admin can see all stories, public only sees published
    const stories = await prisma.story.findMany({
      where: isAdmin ? {} : { isPublished: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, stories });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create new story (Admin only)
export async function POST(request) {
  try {
    // Check authentication
    const { session, error } = await requireAuth(request, "ADMIN");
    if (error) return error;

    const prisma = await getPrismaClient();
    const data = await request.json();

    // Validate required fields
    validateRequest(data, ["title", "content"]);

    const { title, content, imageUrl, featuredImage, isPublished, order } =
      data;

    const story = await prisma.story.create({
      data: {
        title,
        content,
        featuredImage: featuredImage || imageUrl || null, // Support both field names
        isPublished: isPublished || false,
        order: order || 0,
      },
    });

    return NextResponse.json({ success: true, story }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
