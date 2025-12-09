import { NextResponse, NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Get authenticated admin user ID
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

    if (adminRole !== "ADMIN") {
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

    // Prevent Self-Delete: Check if admin is trying to delete themselves
    if (adminUserId === targetUserId) {
      return NextResponse.json(
        { error: "Admin cannot delete themselves" },
        { status: 400 }
      );
    }

    // Check if target user exists before deletion
    try {
      await client.users.getUser(targetUserId);
    } catch (error) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Perform Deletion: Delete the user from Clerk
    await client.users.deleteUser(targetUserId);

    // Return success response
    return NextResponse.json(
      {
        message: "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
