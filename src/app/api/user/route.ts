import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// API route to get user company information
export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    console.log("[API /api/user] Auth result userId:", userId);

    if (!userId) {
      console.log("[API /api/user] No userId found - unauthorized");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's company
    console.log("[API /api/user] Searching for company with userId:", userId);
    const company = await prisma.company.findFirst({
      where: { userId: userId },
      select: { id: true, name: true }
    });

    console.log("[API /api/user] Company found:", company ? `Yes (${company.name})` : "No");

    return NextResponse.json({
      userId,
      companyId: company?.id || null
    });

  } catch (error) {
    console.error("[API /api/user] Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
