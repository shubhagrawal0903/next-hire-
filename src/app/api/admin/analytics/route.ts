import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
   
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role using Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const role = clerkUser?.publicMetadata?.role as string | undefined;

    if (role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    
    const totalUsers = await clerk.users.getCount();

    const [
      totalCompanies,
      verifiedCompanies,
      totalJobs,
      totalApplications,
      pendingApplications,
    ] = await prisma.$transaction([
      prisma.company.count(),
      prisma.company.count({ where: { isVerified: true } }),
      prisma.job.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'Pending' } }),
    ]);

    // Top companies by number of jobs posted
    const topCompaniesByJobs = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { jobs: true } },
      },
      orderBy: {
        jobs: { _count: 'desc' },
      },
      take: 5,
    });

    // Companies with application counts
    const companiesWithAppCounts = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { jobs: true } },
        jobs: {
          select: {
            _count: { select: { applications: true } },
          },
        },
      },
    });

    const companyAppStats = companiesWithAppCounts.map((c) => {
      const applicationCount = c.jobs.reduce((acc, j) => acc + (j._count?.applications || 0), 0);
      return {
        id: c.id,
        name: c.name,
        jobCount: c._count?.jobs || 0,
        applicationCount,
      };
    })
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5);

    const basicStats = {
      totalUsers,
      totalCompanies,
      verifiedCompanies,
      totalJobs,
      totalApplications,
      pendingApplications,
    };

    return NextResponse.json({ basicStats, topCompaniesByJobs, companyAppStats }, { status: 200 });
  } catch (error: any) {
    console.error("Error in admin analytics GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
