import { NextResponse, NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    // Get authenticated user ID
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Admin Role Check: Verify user has admin role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;

    if (role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Await params to get companyId (Next.js 15+)
    const { companyId } = await context.params;

    // Validate companyId exists
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Clean the ID: remove brackets and trim whitespace
    const cleanedCompanyId = String(companyId)
      .replace(/\[|\]/g, '')  // Remove square brackets
      .trim();                 // Remove whitespace

    // Validate cleaned ID (MongoDB ObjectID must be exactly 24 hexadecimal characters)
    if (!cleanedCompanyId || cleanedCompanyId.length !== 24 || !/^[a-f0-9]{24}$/i.test(cleanedCompanyId)) {
      return NextResponse.json(
        { error: "Invalid Company ID format" },
        { status: 400 }
      );
    }

    // Verify Company Exists
    const existingCompany = await prisma.company.findUnique({
      where: {
        id: cleanedCompanyId,
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Perform Update: Set isVerified to true
    const updatedCompany = await prisma.company.update({
      where: {
        id: cleanedCompanyId,
      },
      data: {
        isVerified: true,
      },
    });

    // Return the updated company data
    return NextResponse.json(
      {
        message: "Company verified successfully",
        company: updatedCompany,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying company:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
