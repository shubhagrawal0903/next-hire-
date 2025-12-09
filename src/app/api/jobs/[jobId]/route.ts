// File: src/app/api/jobs/[jobId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    // Await params to get jobId (Next.js 15+)
    const { jobId: rawJobId } = await context.params;

    // Extract and clean jobId from params
    let cleanedJobId = String(rawJobId);

    // Remove URL-encoded brackets if present
    cleanedJobId = decodeURIComponent(cleanedJobId);
    cleanedJobId = cleanedJobId.replace(/\[|\]/g, "").trim();

    // Validate MongoDB ObjectID format (24 hex characters)
    if (!cleanedJobId || cleanedJobId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(cleanedJobId)) {
      console.error("Invalid jobId format:", cleanedJobId);
      return NextResponse.json(
        { error: "Invalid Job ID format" },
        { status: 400 }
      );
    }

    // Fetch the job with company details
    const job = await prisma.job.findUnique({
      where: { id: cleanedJobId },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    // Check if job exists
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Return the job data with company details
    return NextResponse.json(job, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching job:", error);

    // Handle Prisma-specific errors
    if (error.code === 'P2023' || (error.message && error.message.includes("Malformed ObjectID"))) {
      return NextResponse.json(
        { error: "Invalid Job ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    // Get userId from Clerk auth (await is required in Next.js 15+)
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.error("Unauthorized: No userId found in auth context");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await params to get jobId (Next.js 15+)
    const { jobId: rawJobId } = await context.params;

    // Extract and clean jobId from params
    let cleanedJobId = String(rawJobId);

    // Remove URL-encoded brackets if present
    cleanedJobId = decodeURIComponent(cleanedJobId);
    cleanedJobId = cleanedJobId.replace(/\[|\]/g, "").trim();

    // Validate MongoDB ObjectID format (24 hex characters)
    if (!cleanedJobId || cleanedJobId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(cleanedJobId)) {
      console.error("Invalid jobId format:", cleanedJobId);
      return NextResponse.json(
        { error: "Invalid Job ID format" },
        { status: 400 }
      );
    }

    // Get the updates from request body
    const updates = await request.json();

    // Authorization Check: Verify the job exists and user owns it
    const existingJob = await prisma.job.findUnique({
      where: { id: cleanedJobId },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    if (existingJob.userId !== userId) {
      return NextResponse.json(
        { error: "You do not own this job posting" },
        { status: 403 }
      );
    }

    // Prepare data for update with type conversions
    const updateData: any = {};

    // Handle basic string fields
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.employmentType !== undefined) updateData.employmentType = updates.employmentType;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.applyLink !== undefined) updateData.applyLink = updates.applyLink || null;
    if (updates.salaryCurrency !== undefined) updateData.salaryCurrency = updates.salaryCurrency || null;

    // Handle numeric fields (salary)
    if (updates.salaryMin !== undefined) {
      updateData.salaryMin = updates.salaryMin ? parseInt(updates.salaryMin) : null;
    }
    if (updates.salaryMax !== undefined) {
      updateData.salaryMax = updates.salaryMax ? parseInt(updates.salaryMax) : null;
    }

    // Handle array fields (requirements, responsibilities)
    if (updates.requirements !== undefined) {
      if (typeof updates.requirements === 'string') {
        // If it's a comma-separated string, split it
        updateData.requirements = updates.requirements
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s);
      } else if (Array.isArray(updates.requirements)) {
        // If it's already an array, use it directly
        updateData.requirements = updates.requirements;
      }
    }

    if (updates.responsibilities !== undefined) {
      if (typeof updates.responsibilities === 'string') {
        // If it's a comma-separated string, split it
        updateData.responsibilities = updates.responsibilities
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s);
      } else if (Array.isArray(updates.responsibilities)) {
        // If it's already an array, use it directly
        updateData.responsibilities = updates.responsibilities;
      }
    }

    // Handle date fields
    if (updates.expiresAt !== undefined) {
      updateData.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
    }

    // Perform the update
    const updatedJob = await prisma.job.update({
      where: { id: cleanedJobId },
      data: updateData,
    });

    return NextResponse.json(updatedJob, { status: 200 });

  } catch (error: any) {
    console.error("Error updating job:", error);

    // Handle Prisma-specific errors
    if (error.code === 'P2023' || (error.message && error.message.includes("Malformed ObjectID"))) {
      return NextResponse.json(
        { error: "Invalid Job ID format" },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    // Get userId from Clerk auth (await is required in Next.js 15+)
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.error("Unauthorized: No userId found in auth context");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await params to get jobId (Next.js 15+)
    const { jobId: rawJobId } = await context.params;

    // Extract and clean jobId from params
    let cleanedJobId = String(rawJobId);

    // Remove URL-encoded brackets if present
    cleanedJobId = decodeURIComponent(cleanedJobId);
    cleanedJobId = cleanedJobId.replace(/\[|\]/g, "").trim();

    // Validate MongoDB ObjectID format (24 hex characters)
    if (!cleanedJobId || cleanedJobId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(cleanedJobId)) {
      console.error("Invalid jobId format:", cleanedJobId);
      return NextResponse.json(
        { error: "Invalid Job ID format" },
        { status: 400 }
      );
    }

    // Authorization Check: Verify the job exists and user owns it
    const existingJob = await prisma.job.findUnique({
      where: { id: cleanedJobId },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    if (existingJob.userId !== userId) {
      return NextResponse.json(
        { error: "You do not own this job posting" },
        { status: 403 }
      );
    }

    // Delete the job (related Applications will be cascade deleted due to schema relation)
    await prisma.job.delete({
      where: { id: cleanedJobId },
    });

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error deleting job:", error);

    // Handle Prisma-specific errors
    if (error.code === 'P2023' || (error.message && error.message.includes("Malformed ObjectID"))) {
      return NextResponse.json(
        { error: "Invalid Job ID format" },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
