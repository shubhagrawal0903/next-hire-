import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Map incoming role strings to canonical Clerk publicMetadata roles
const ROLE_MAP: Record<string, string> = {
  user: "JOB_SEEKER",
  client: "COMPANY_ERP",
  admin: "ADMIN",
  // Allow passing canonical values directly too
  JOB_SEEKER: "JOB_SEEKER",
  COMPANY_ERP: "COMPANY_ERP",
  ADMIN: "ADMIN",
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();

    if (!role || !ROLE_MAP[role]) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const canonicalRole = ROLE_MAP[role];

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: canonicalRole,
      },
    });

    return NextResponse.json({ success: true, role: canonicalRole });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
