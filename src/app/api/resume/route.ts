import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

export async function POST(request: Request) {
  try {
    // Authentication: Check if user is authenticated
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Get File Data: Process multipart/form-data
    const formData = await request.formData();
    
    // Try to get the file using the expected key
    const file = formData.get("resume") as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    // Validate file type (PDF or DOCX)
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert buffer to base64 string for Cloudinary upload
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary with improved configuration
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(base64String, {
        resource_type: "raw", // Use "raw" for document files (PDF, DOCX, etc.)
        folder: "resumes", // Organize uploads in a "resumes" folder
        public_id: `resume_${userId}_${Date.now()}`, // Unique filename
        overwrite: true, // Overwrite if same public_id exists
        timeout: 60000, // 60 second timeout to handle larger files
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error details:", {
        name: cloudinaryError instanceof Error ? cloudinaryError.name : "Unknown",
        message: cloudinaryError instanceof Error ? cloudinaryError.message : "Unknown error",
        error: cloudinaryError,
      });
      throw new Error(
        `Cloudinary upload failed: ${cloudinaryError instanceof Error ? cloudinaryError.message : "Unknown error"}`
      );
    }

    // Return the secure URL
    return NextResponse.json(
      {
        message: "Resume uploaded successfully",
        url: uploadResult.secure_url,
        secure_url: uploadResult.secure_url, // Include both for compatibility
        publicId: uploadResult.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading resume - Full error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });

    // Handle specific error types
    if (error instanceof Error) {
      // Check for timeout errors
      if (error.name === "TimeoutError" || error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error: "Upload timed out. Please try again with a smaller file or check your connection.",
            details: error.message,
          },
          { status: 504 } // Gateway Timeout
        );
      }

      // Check for Cloudinary-specific errors
      if (error.message.includes("Cloudinary")) {
        return NextResponse.json(
          {
            error: "Cloud storage error occurred.",
            details: error.message,
          },
          { status: 500 }
        );
      }

      // Generic error response
      return NextResponse.json(
        {
          error: "Upload failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error during file upload" },
      { status: 500 }
    );
  }
}
