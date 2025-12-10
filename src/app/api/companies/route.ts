// File: app/api/companies/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server"; 
import prisma from "@/lib/prisma";
import { getUserRole, setDefaultUserRole } from "@/lib/clerk-utils";

export async function POST(request: Request) {
  try {
    // Defensive logging: Check if Clerk secret key is loaded
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CRITICAL: CLERK_SECRET_KEY is missing from environment variables!");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    // IMPORTANT: auth() MUST be awaited in Next.js 15+
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.error("Unauthorized: No userId found in auth context");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get Clerk client instance
    const client = await clerkClient();

    // Get the full user object including metadata
    const user = await client.users.getUser(userId);
    const currentRole = user.publicMetadata?.role as string | undefined;

    console.log(`User ${userId} current role: ${currentRole || 'not set'}`);

    // If user has no role, set default to JOB_SEEKER first
    if (!currentRole) {
      try {
        console.log(`User ${userId} has no role set. Setting default role to JOB_SEEKER.`);
        await setDefaultUserRole(userId);
      } catch (roleError) {
        console.error("Failed to set default user role:", roleError);
      }
    }

    const body = await request.json();

    // Explicitly extract all fields including certificate URLs
    const { 
      name, 
      registrationNumber, 
      contactEmail, 
      yearFounded,
      registrationCertificateUrl,
      taxCertificateUrl,
      incorporationCertificateUrl,
      additionalDocumentUrl,
      ...otherData 
    } = body;

    if (!name || !registrationNumber || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log('Certificate URLs received:', {
      registrationCertificateUrl,
      taxCertificateUrl,
      incorporationCertificateUrl,
      additionalDocumentUrl
    });

    const newCompany = await prisma.company.create({
      data: {
        name,
        registrationNumber,
        contactEmail,
        yearFounded: yearFounded ? parseInt(yearFounded) : undefined,
        registrationCertificateUrl: registrationCertificateUrl || undefined,
        taxCertificateUrl: taxCertificateUrl || undefined,
        incorporationCertificateUrl: incorporationCertificateUrl || undefined,
        additionalDocumentUrl: additionalDocumentUrl || undefined,
        ...otherData,
        userId: userId, 
      },
    });

    console.log('Company created with certificates:', {
      id: newCompany.id,
      hasCertificates: {
        registration: !!newCompany.registrationCertificateUrl,
        tax: !!newCompany.taxCertificateUrl,
        incorporation: !!newCompany.incorporationCertificateUrl,
        additional: !!newCompany.additionalDocumentUrl
      }
    });

    // Upgrade user role to COMPANY_ERP if they are currently JOB_SEEKER or have no role
    if (!currentRole || currentRole === 'JOB_SEEKER') {
      try {
        console.log(`Upgrading user ${userId} role from '${currentRole || 'not set'}' to 'COMPANY_ERP'`);
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            role: 'COMPANY_ERP'
          }
        });
        console.log(`Successfully upgraded user ${userId} to COMPANY_ERP`);
      } catch (roleUpgradeError) {
        // Log error but don't block the response since company was created
        console.error(`Failed to upgrade user ${userId} to COMPANY_ERP:`, roleUpgradeError);
      }
    }

    return NextResponse.json(newCompany, { status: 201 });

  } catch (error: any) {
    console.error("Error creating company:", error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Company with this email or registration number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  try {
    // Get userId from Clerk auth (await is required in Next.js 15+)
    const authResult = await auth();
    const userId = authResult?.userId;

    // Detailed logging for debugging
    console.log("GET /api/companies - Fetched userId:", userId);

    if (!userId) {
      console.error("Unauthorized: No userId found in auth context");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Log the Prisma query being attempted
    console.log("GET /api/companies - Prisma Query:", { where: { userId: userId } });

    // Fetch companies belonging to the logged-in user
    // Select only id and name to keep the payload light
    const companies = await prisma.company.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Log the Prisma result
    console.log("GET /api/companies - Prisma Result:", companies);

    return NextResponse.json(companies, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
