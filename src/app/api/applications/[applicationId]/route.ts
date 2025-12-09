import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ applicationId: string }> }
) {
  try {
    
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.error("Unauthorized: No userId found in auth context");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    
    const { applicationId: rawApplicationId } = await context.params;

    let cleanedApplicationId = String(rawApplicationId);
    cleanedApplicationId = decodeURIComponent(cleanedApplicationId);
    cleanedApplicationId = cleanedApplicationId.replace(/\[|\]/g, "").trim();

    if (
      !cleanedApplicationId ||
      cleanedApplicationId.length !== 24 ||
      !/^[a-fA-F0-9]{24}$/.test(cleanedApplicationId)
    ) {
      console.error("Invalid applicationId format:", cleanedApplicationId);
      return NextResponse.json(
        { error: "Invalid Application ID format" },
        { status: 400 }
      );
    }

    const { status } = await request.json();
    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { error: "Status is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate status value (optional but recommended)
    const validStatuses = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED", "INTERVIEW"];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Authorization Check: Fetch application with job and company details
    const application = await prisma.application.findUnique({
      where: { id: cleanedApplicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the company owner matches the logged-in user
    if (application.job.company.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to update this application" },
        { status: 403 }
      );
    }

    // Perform the update
    const updatedApplication = await prisma.application.update({
      where: { id: cleanedApplicationId },
      data: { status: status.toUpperCase() },
      include: {
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    const newStatus = status.toUpperCase();
    sendEmail(
      updatedApplication.applicantEmail,
      `Application Status Update - ${updatedApplication.job.title}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Status Update</h2>
          <p>Hello <strong>${updatedApplication.applicantName}</strong>,</p>
          <p>Your application status for the job "<strong>${updatedApplication.job.title}</strong>" has been updated to:</p>
          <p style="font-size: 18px; color: #2563eb; font-weight: bold;">${newStatus}</p>
          <p>You can view your application details in your dashboard.</p>
          <br/>
          <p>Regards,<br/>
          <strong>Next Hire Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            <strong>Applicant Details:</strong><br/>
            Name: ${updatedApplication.applicantName}<br/>
            Email: ${updatedApplication.applicantEmail}<br/>
            Job: ${updatedApplication.job.title}<br/>
            New Status: ${newStatus}
          </p>
        </div>
      `
    ).catch((emailError) => {
      console.error('Failed to send status update email:', emailError);
    });

    return NextResponse.json(updatedApplication, { status: 200 });
  } catch (error: any) {
    console.error("Error updating application:", error);

    if (
      error.code === "P2023" ||
      (error.message && error.message.includes("Malformed ObjectID"))
    ) {
      return NextResponse.json(
        { error: "Invalid Application ID format" },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
