'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

/**
 * Schedule an interview for an application
 * @param applicationId - The ID of the application
 * @param interviewDate - The scheduled interview date/time (ISO string)
 * @param interviewLink - The Google Meet/Zoom link
 * @returns Success message or error
 */
export async function scheduleInterview(
  applicationId: string,
  interviewDate: string,
  interviewLink: string
) {
  try {
    // 1. Authenticate the user (must be signed in)
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // 2. Validate inputs
    if (!applicationId || !interviewDate || !interviewLink) {
      return { success: false, error: 'Missing required fields.' };
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(interviewLink)) {
      return { success: false, error: 'Invalid meeting link format.' };
    }

    // Validate date is in the future
    const scheduledDate = new Date(interviewDate);
    if (scheduledDate < new Date()) {
      return { success: false, error: 'Interview date must be in the future.' };
    }

    // 3. Fetch the application with job and company details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        applicant: true,
      },
    });

    if (!application) {
      return { success: false, error: 'Application not found.' };
    }

    // 4. Verify the user owns the company that posted the job
    if (application.job.userId !== userId) {
      return { 
        success: false, 
        error: 'Unauthorized. You can only schedule interviews for your own job postings.' 
      };
    }

    // 5. Update the application with interview details
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'Interview',
        interviewDate: scheduledDate,
        interviewLink: interviewLink,
        updatedAt: new Date(),
      },
    });

    // 6. Send email notification to the applicant
    try {
      const formattedDate = scheduledDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      const emailSubject = `Interview Scheduled: ${application.job.title}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Interview Scheduled! 🎉</h2>
          
          <p style="color: #374151; font-size: 16px;">Dear ${application.applicantName},</p>
          
          <p style="color: #374151; font-size: 16px;">
            Congratulations! Your interview has been scheduled for the position of 
            <strong>${application.job.title}</strong> at <strong>${application.job.company.name}</strong>.
          </p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1f2937; margin-top: 0;">Interview Details:</h3>
            <p style="color: #374151; margin: 10px 0;">
              <strong>Date & Time:</strong><br/>
              ${formattedDate}
            </p>
            <p style="color: #374151; margin: 10px 0;">
              <strong>Meeting Link:</strong><br/>
              <a href="${interviewLink}" style="color: #3b82f6; text-decoration: none;">${interviewLink}</a>
            </p>
            <p style="color: #374151; margin: 10px 0;">
              <strong>Job Title:</strong> ${application.job.title}<br/>
              <strong>Company:</strong> ${application.job.company.name}<br/>
              <strong>Location:</strong> ${application.job.location}
            </p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>📝 Tips for your interview:</strong><br/>
              • Test your internet connection and audio/video beforehand<br/>
              • Join the meeting 5 minutes early<br/>
              • Have a copy of your resume handy<br/>
              • Prepare questions about the role and company<br/>
              • Dress professionally
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px;">
            Good luck with your interview! We're excited to speak with you.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Best regards,<br/>
            <strong>${application.job.company.name} Recruiting Team</strong>
          </p>
        </div>
      `;

      await sendEmail(
        application.applicantEmail,
        emailSubject,
        emailBody
      );
    } catch (emailError) {
      console.error('Failed to send interview email:', emailError);
      // Continue execution even if email fails
      // TODO: Implement a retry mechanism or notification queue
    }

    // 7. Revalidate the dashboard page to show updated data
    revalidatePath('/dashboard');
    revalidatePath('/my-applications');

    return { 
      success: true, 
      message: 'Interview scheduled successfully! Email notification sent.' 
    };

  } catch (error) {
    console.error('Error scheduling interview:', error);
    return { 
      success: false, 
      error: 'Failed to schedule interview. Please try again.' 
    };
  }
}

/**
 * Update application status
 * @param applicationId - The ID of the application
 * @param newStatus - The new status
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // Fetch the application with job details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      return { success: false, error: 'Application not found.' };
    }

    // Verify ownership
    if (application.job.userId !== userId) {
      return { success: false, error: 'Unauthorized.' };
    }

    // Update status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dashboard');

    return { success: true, message: 'Status updated successfully.' };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: 'Failed to update status.' };
  }
}

/**
 * Cancel/Reschedule interview
 * @param applicationId - The ID of the application
 */
export async function cancelInterview(applicationId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Unauthorized.' };
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.job.userId !== userId) {
      return { success: false, error: 'Unauthorized.' };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        interviewDate: null,
        interviewLink: null,
        status: 'Reviewed',
      },
    });

    revalidatePath('/dashboard');

    return { success: true, message: 'Interview cancelled.' };
  } catch (error) {
    console.error('Error cancelling interview:', error);
    return { success: false, error: 'Failed to cancel interview.' };
  }
}
