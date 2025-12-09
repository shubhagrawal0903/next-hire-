import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/user/profile
 * Retrieves the logged-in user's profile from the UserProfile model
 */
export async function GET(request: Request) {
  try {
    // 1. Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 2. Find the user's profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    // 3. Return profile or 404 if not found
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please create a profile first." },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch profile. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Updates or creates the logged-in user's profile in the UserProfile model
 * Also updates Clerk metadata if resumeUrl is provided
 */
export async function PATCH(request: Request) {
  try {
    // 1. Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 2. Get updates from request body
    const updates = await request.json();

    // Validate resumeUrl format if provided
    if (updates.resumeUrl) {
      try {
        new URL(updates.resumeUrl);
      } catch (urlError) {
        return NextResponse.json(
          { error: "Invalid URL format. Please provide a valid resume URL." },
          { status: 400 }
        );
      }
    }

    // 3. Upsert the user profile in Prisma
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...updates,
      },
      update: {
        ...updates,
      },
    });

    // 4. If resumeUrl is in updates, also update Clerk metadata
    if (updates.resumeUrl) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          resumeUrl: updates.resumeUrl,
        },
      });
    }

    // 5. Return the updated profile
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        profile: updatedProfile,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating user profile:", error);
    
    return NextResponse.json(
      {
        error: "Failed to update profile. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
