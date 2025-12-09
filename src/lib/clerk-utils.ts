// File: src/lib/clerk-utils.ts
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Sets the default user role to 'JOB_SEEKER' if not already set
 * @param userId - The Clerk user ID
 * @returns Promise<void>
 */
export async function setDefaultUserRole(userId: string): Promise<void> {
  try {
    // Check if CLERK_SECRET_KEY is available
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CLERK_SECRET_KEY is not set in environment variables");
      throw new Error("Clerk configuration error");
    }

    // Get Clerk client instance
    const client = await clerkClient();

    // Update user metadata to set default role
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'JOB_SEEKER'
      }
    });

    console.log(`Default role 'JOB_SEEKER' set for user: ${userId}`);
  } catch (error: any) {
    console.error(`Failed to set default role for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Gets the user's role from Clerk metadata
 * @param userId - The Clerk user ID
 * @returns Promise<string | null> - The user's role or null if not set
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;
    return role || null;
  } catch (error: any) {
    console.error(`Failed to get user role for ${userId}:`, error);
    return null;
  }
}

/**
 * Checks if user has a specific role
 * @param userId - The Clerk user ID
 * @param requiredRole - The role to check for
 * @returns Promise<boolean>
 */
export async function hasRole(userId: string, requiredRole: string): Promise<boolean> {
  try {
    const userRole = await getUserRole(userId);
    return userRole === requiredRole;
  } catch (error) {
    console.error(`Failed to check role for user ${userId}:`, error);
    return false;
  }
}
