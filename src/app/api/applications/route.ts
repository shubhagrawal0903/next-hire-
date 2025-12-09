import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { applicationService } from "@/services/application.service";

export async function POST(request: Request) {
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

    // Get request body
    const body = await request.json();
    const { jobId, applicantName, applicantEmail, resumeUrl, coverLetter } = body;

    // Validation: Check required fields
    if (!jobId || !applicantName || !applicantEmail || !resumeUrl) {
      return NextResponse.json(
        { error: "Missing required fields: jobId, applicantName, applicantEmail, and resumeUrl are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for existing application (user can only apply once per job)
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    // Verify the job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Create the application using the service (includes background ATS scoring)
    const application = await applicationService.createApplication({
      jobId,
      userId,
      applicantName,
      applicantEmail,
      resumeUrl,
      coverLetter: coverLetter || null,
    });

    // Return success response with the created application
    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating application:", error);

    // Handle Prisma unique constraint error (P2002)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
