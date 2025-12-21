import { NextResponse, NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Get authenticated admin user IDx
    const { userId: adminUserId } = await auth();

    // Check if user is authenticated
    if (!adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Admin Role Check: Verify requesting user has admin role
    const client = await clerkClient();
    const adminUser = await client.users.getUser(adminUserId);
    const adminRole = adminUser.publicMetadata?.role as string | undefined;

    if (adminRole?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Await params to get userId (Next.js 15+)
    const { userId } = await context.params;

    // Validate userId exists
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Clean the userId: trim whitespace
    const targetUserId = String(userId).trim();

    // Validate cleaned ID
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    // Get the new role from request body
    const body = await request.json();
    const { role: newRole } = body;

    // Validate newRole is provided
    if (!newRole) {
      return NextResponse.json(
        { error: "Role is required in request body" },
        { status: 400 }
      );
    }

    // Validate newRole is a valid role string
    const validRoles = ["JOB_SEEKER", "COMPANY_ERP", "ADMIN"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if target user exists
    try {
      await client.users.getUser(targetUserId);
    } catch (error) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Perform Update: Update the target user's role
    const updatedUser = await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: newRole,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        message: "User role updated successfully",
        userId: updatedUser.id,
        newRole: newRole,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
