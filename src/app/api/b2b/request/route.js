import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { B2BRequestModel } from "@/models/B2BRequestModel";

/**
 * POST /api/b2b/request
 * Create B2B registration request
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is already B2B
    if (session.user.role === "B2B") {
      return NextResponse.json(
        { error: "You are already a B2B customer" },
        { status: 400 }
      );
    }

    // Check if user is admin
    if (session.user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin cannot request B2B access" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.businessName || !body.phone || !body.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has a pending/approved request
    const existingRequest = await B2BRequestModel.findByUserId(session.user.id);
    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { error: "You already have a pending B2B request" },
          { status: 400 }
        );
      }
      if (existingRequest.status === "APPROVED") {
        return NextResponse.json(
          { error: "Your B2B request has already been approved" },
          { status: 400 }
        );
      }
      // If rejected, allow resubmission by deleting old request
      if (existingRequest.status === "REJECTED") {
        await B2BRequestModel.delete(existingRequest.id);
      }
    }

    const b2bRequest = await B2BRequestModel.create({
      userId: session.user.id,
      businessName: body.businessName,
      phone: body.phone,
      address: body.address,
    });

    return NextResponse.json(
      {
        success: true,
        data: b2bRequest,
        message: "B2B request submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating B2B request:", error);

    if (error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create B2B request" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/b2b/request
 * Get user's B2B request status
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const b2bRequest = await B2BRequestModel.findByUserId(session.user.id);

    if (!b2bRequest) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: b2bRequest,
    });
  } catch (error) {
    console.error("Error fetching B2B request:", error);
    return NextResponse.json(
      { error: "Failed to fetch B2B request" },
      { status: 500 }
    );
  }
}
