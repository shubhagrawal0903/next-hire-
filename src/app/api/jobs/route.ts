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

    if (userRole !== 'COMPANY_ERP' && userRole !== 'client') {
      console.error(`Forbidden: User ${userId} with role ${userRole} attempted to post job`);
      return NextResponse.json(
        { message: 'Forbidden: Only company users can post jobs' },
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
    // Get userId from Clerk auth (await is required in Next.js 15+)
    const authResult = await auth();
    const userId = authResult?.userId;

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const employmentType = searchParams.get("employmentType");
    const mine = searchParams.get("mine"); // Filter to only the current user's jobs
    const rawSearch = searchParams.get("search");
    const search = rawSearch?.trim();
    const page = searchParams.get("page") || "1";
    const pageNum = parseInt(page) || 1;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : mine ? 9 : 8; // 9 per page for "my jobs", 8 elsewhere
    const excludeIds = searchParams.get("excludeIds")?.split(',').filter(id => id.trim()) || [];

    // Build filter object for Prisma query
    // When fetching the user's own jobs, do NOT restrict by status so all postings appear
    const where: any = mine ? {} : { status: searchParams.get("status") || "active" };

    // Filter by userId if 'mine' parameter is present and user is authenticated
    if (mine && userId) {
      where.userId = userId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (employmentType) {
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

    // Get total count of jobs matching the filters
    const totalJobs = await prisma.job.count({ where });

    // Fetch jobs with selected company information and pagination
    const jobs = await prisma.job.findMany({
      where: {
        ...where,
        company: {
          is: {},
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: {
        // For the user's own jobs list, sort by creation date (newest first)
        // For public listings, sort by posting date
        createdAt: "desc",
      },
      take: limit,
      skip: (pageNum - 1) * limit,
    });

    return NextResponse.json({ jobs, totalJobs }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}