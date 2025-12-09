import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
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

    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch Unverified Companies
    const unverifiedCompanies = await prisma.company.findMany({
      where: {
        isVerified: false,
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        website: true,
        createdAt: true,
        registrationNumber: true,
        companyType: true,
        industry: true,
        registrationCertificateUrl: true,
        taxCertificateUrl: true,
        incorporationCertificateUrl: true,
        additionalDocumentUrl: true,
      },
      orderBy: {
        createdAt: "asc", // Oldest unverified companies first
      },
    });

    // Return the list of unverified companies
    return NextResponse.json(unverifiedCompanies, { status: 200 });
  } catch (error) {
    console.error("Error fetching unverified companies:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
