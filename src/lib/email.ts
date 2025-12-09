import nodemailer from 'nodemailer';

// Initialize Nodemailer transporter with Gmail (Production Mode)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true
  }
});

/**
 * Send an email using Nodemailer
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @returns Promise with the email send result
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Send email via Nodemailer
    const info = await transporter.sendMail({
      from: `"Next Hire" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    // Success - log the message ID
    console.log('Email sent successfully:', info.messageId);

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
