import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
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
      .replace(/\[|\]/g, '')
      .trim();

    // Validate cleaned ID (MongoDB ObjectID must be exactly 24 characters)
    if (!cleanedCompanyId || cleanedCompanyId.length !== 24) {
      return NextResponse.json(
        { error: "Invalid Company ID format" },
        { status: 400 }
      );
    }

    // Authorization Check: Verify company exists and user owns it
    console.log("API FetchCompanyAuth - Prisma Query:", { where: { id: cleanedCompanyId } });
    const company = await prisma.company.findUnique({
      where: {
        id: cleanedCompanyId,
      },
    });

    // Check if company exists
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if user owns this company
    if (company.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this company" },
        { status: 403 }
      );
    }

    // Fetch all applications for jobs belonging to this company
    const applications = await prisma.application.findMany({
      where: {
        job: {
          companyId: cleanedCompanyId,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent applications first
      },
    });

    // Return the list of applications
    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Error fetching company applications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
