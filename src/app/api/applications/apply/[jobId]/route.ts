import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { applicationService } from "@/services/application.service"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Get authenticated user ID
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    // Extract jobId from route params (Next.js 15 requires awaiting params)
    const { jobId } = await params

    // Parse multipart form data
    const formData = await request.formData()

    // Extract form fields
    const applicantName = formData.get("applicantName") as string
    const applicantEmail = formData.get("applicantEmail") as string
    const coverLetter = formData.get("coverLetter") as string | null
    const resumeFile = formData.get("resume") as File | null

    // Validation: Check required fields
    if (!applicantName || !applicantEmail || !resumeFile) {
      return NextResponse.json(
        { error: "Missing required fields: applicantName, applicantEmail, and resume file are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(applicantEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate file type (PDF only)
    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (resumeFile.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Check for existing application (user can only apply once per job)
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      )
    }

    // Verify the job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await resumeFile.arrayBuffer()
    const resumeBuffer = Buffer.from(arrayBuffer)
    const originalFileName = resumeFile.name

    // Create the application using the refactored service
    // This will: 1) Upload to Cloudinary, 2) Create DB record, 3) Trigger background ATS scoring
    const application = await applicationService.createApplication({
      jobId,
      userId,
      applicantName,
      applicantEmail,
      resumeBuffer,
      originalFileName,
      coverLetter: coverLetter || null,
    })

    // Return success response
    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application: {
          id: application.id,
          jobId: application.jobId,
          status: application.status,
          createdAt: application.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[Application API] Error creating application:", error)

    // Handle Prisma unique constraint error (P2002)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      )
    }

    // Handle Cloudinary errors
    if (error.message && error.message.includes("Cloudinary")) {
      return NextResponse.json(
        { error: "Failed to upload resume. Please try again." },
        { status: 500 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to submit application",
        details: error.message || "Internal Server Error"
      },
      { status: 500 }
    )
  }
}
