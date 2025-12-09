import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
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
    const cleanedId = String(companyId)
      .replace(/\[|\]/g, '')  // Remove square brackets
      .trim();                 // Remove whitespace

    // Validate cleaned ID (MongoDB ObjectID must be exactly 24 characters)
    if (!cleanedId || cleanedId.length !== 24) {
      return NextResponse.json(
        { error: "Invalid Company ID format" },
        { status: 400 }
      );
    }

    // Find company by ID
    const company = await prisma.company.findUnique({
      where: {
        id: cleanedId,
      },
    });

    // Check if company exists
    if (!company) {
      return NextResponse.json(
        { error: "Company Not Found" },
        { status: 404 }
      );
    }

    // Return company data
    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error("Error fetching company details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    const cleanedId = String(companyId)
      .replace(/\[|\]/g, '')  // Remove square brackets
      .trim();                 // Remove whitespace

    // Validate cleaned ID (MongoDB ObjectID must be exactly 24 characters)
    if (!cleanedId || cleanedId.length !== 24) {
      return NextResponse.json(
        { error: "Invalid Company ID format" },
        { status: 400 }
      );
    }

    // Get updates from request body
    const updates = await request.json();

    // Authorization Check: Verify company exists and user owns it
    const existingCompany = await prisma.company.findUnique({
      where: {
        id: cleanedId,
      },
    });

    // Check if company exists
    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company Not Found" },
        { status: 404 }
      );
    }

    // Check if user owns this company
    if (existingCompany.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this company" },
        { status: 403 }
      );
    }

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: {
        id: cleanedId,
      },
      data: updates,
    });

    // Return updated company data
    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const cleanedId = String(companyId)
      .replace(/\[|\]/g, '')  // Remove square brackets
      .trim();                 // Remove whitespace

    // Validate cleaned ID (MongoDB ObjectID must be exactly 24 characters)
    if (!cleanedId || cleanedId.length !== 24) {
      return NextResponse.json(
        { error: "Invalid Company ID format" },
        { status: 400 }
      );
    }

    // Authorization Check: Verify company exists and user owns it
    const existingCompany = await prisma.company.findUnique({
      where: {
        id: cleanedId,
      },
    });

    // Check if company exists
    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company Not Found" },
        { status: 404 }
      );
    }

    // Check if user owns this company
    if (existingCompany.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - You do not own this company" },
        { status: 403 }
      );
    }

    // Delete the company (cascade delete will remove all associated jobs)
    await prisma.company.delete({
      where: {
        id: cleanedId,
      },
    });

    // Return success message
    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
