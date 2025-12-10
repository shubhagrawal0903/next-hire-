import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CRITICAL: CLERK_SECRET_KEY is missing from environment variables!");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.error("Unauthorized: No userId found in auth context");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string | undefined;

    if (userRole !== 'COMPANY_ERP') {
      console.error(`Forbidden: User ${userId} with role ${userRole} attempted to post job`);
      return NextResponse.json(
        { message: 'Forbidden: Only company ERP users can post jobs' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      companyId,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      salaryCurrency,
      requirements,
      responsibilities,
      applyLink,
      expiresAt,
      status,
    } = body;

    if (!title || !description || !companyId || !location || !employmentType) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, companyId, location, employmentType" },
        { status: 400 }
      );
    }

    const jobData = {
      title,
      description,
      companyId,
      location,
      employmentType,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      salaryCurrency: salaryCurrency || undefined,
      requirements: `${requirements || ""}`.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      responsibilities: `${responsibilities || ""}`.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      applyLink: applyLink || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      status: status || "active",
      userId: userId,
    };
    const newJob = await prisma.job.create({
      data: jobData,
    });

    return NextResponse.json(newJob, { status: 201 });

  } catch (error: any) {
    console.error("Error creating job:", error);
    if (error.code === 'P2023' || (error.message && error.message.includes("Malformed ObjectID"))) {
       return NextResponse.json({ error: "Invalid Company ID format." }, { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Define pagination constant
    const JOBS_PER_PAGE = 8;

    // Get userId from Clerk auth (await is required in Next.js 15+)
    const authResult = await auth();
    const userId = authResult?.userId;

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const employmentType = searchParams.get("employmentType");
    const status = searchParams.get("status") || "active"; // Default to active
    const mine = searchParams.get("mine"); // New parameter to filter by current user
    const rawSearch = searchParams.get("search");
    const search = rawSearch?.trim();
    const page = searchParams.get("page") || "1";
    const pageNum = parseInt(page) || 1;
    const excludeIds = searchParams.get("excludeIds")?.split(',').filter(id => id.trim()) || [];

    // Build filter object for Prisma query
    const where: any = { status }; // Use Prisma.JobWhereInput type if possible

    // Filter by userId if 'mine' parameter is present and user is authenticated
    if (mine && userId) {
      where.userId = userId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (employmentType) {
      // Use case-insensitive search if needed, depends on DB collation
      where.employmentType = employmentType;
    }

    // Exclude specific job IDs (e.g., already shown in recommendations)
    if (excludeIds.length > 0) {
      where.id = {
        notIn: excludeIds
      };
    }

    // If a search term is provided, add an OR condition for title, description or location
    if (search) {
      // Ensure existing filters are combined with the search OR using AND
      // e.g., { ...existingFilters..., AND: [ { OR: [ {title: {contains}}, ... ] } ] }
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Get total count of jobs matching the filters (before fetching with company include)
    const totalJobs = await prisma.job.count({ where });

    // Fetch jobs with selected company information and pagination
    // Only fetch jobs that have a valid company relation
    const jobs = await prisma.job.findMany({
      where: {
        ...where,
        company: {
          is: {},
        },
      },
      include: {
        company: { // Include related company data
          select: { // Select only necessary fields
            id: true,
            name: true,
            logoUrl: true,
            // Add any other company fields you need on the job card/modal
          },
        },
      },
      orderBy: {
        postedAt: "desc", // Show newest jobs first
      },
      take: JOBS_PER_PAGE,
      skip: (pageNum - 1) * JOBS_PER_PAGE,
    });

    return NextResponse.json({ jobs, totalJobs }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}