'use server'

import prisma from '@/lib/prisma'

export type AdminDashboardStats = {
    totalUsers: number;
    totalCompanies: number;
    activeJobs: number;
    totalApplications: number;
    jobsByIndustry: { name: string; jobs: number }[];
    appsByStatus: { name: string; value: number }[];
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
    try {
        // 1. Basic Counts
        const [totalUsers, totalCompanies, activeJobs, totalApplications] = await Promise.all([
            prisma.userProfile.count(),
            prisma.company.count(),
            prisma.job.count({ where: { status: 'active' } }),
            prisma.application.count()
        ]);

        // 2. Jobs by Industry
        // Since Industry is on Company, we need to group by Company.industry and count jobs.
        // Prisma doesn't support deep groupBy easily, so we might need a raw query or fetch and aggregate.
        // Given the scale might be small for now, let's fetch jobs with company industry.
        // Optimization: Group by companyId in Job, then map to industry.

        // Let's try a raw query for efficiency if possible, or just fetch all companies and their job counts.
        // Actually, `prisma.company.findMany` with `include: { _count: { select: { jobs: true } } }` is good.
        const companiesWithJobCounts = await prisma.company.findMany({
            select: {
                industry: true,
                _count: {
                    select: {
                        jobs: true
                    }
                }
            }
        });

        // Aggregate by industry
        const industryMap = new Map<string, number>();
        companiesWithJobCounts.forEach(company => {
            const industry = company.industry || 'Unspecified';
            const count = company._count.jobs;
            industryMap.set(industry, (industryMap.get(industry) || 0) + count);
        });

        const jobsByIndustry = Array.from(industryMap.entries())
            .map(([name, jobs]) => ({ name, jobs }))
            .sort((a, b) => b.jobs - a.jobs)
            .slice(0, 5); // Top 5 industries

        // 3. Applications by Status
        const statusGroups = await prisma.application.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });

        const appsByStatus = statusGroups.map(group => ({
            name: group.status,
            value: group._count.status
        }));

        return {
            totalUsers,
            totalCompanies,
            activeJobs,
            totalApplications,
            jobsByIndustry,
            appsByStatus
        };

    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        throw new Error('Failed to fetch admin dashboard statistics');
    }
}
