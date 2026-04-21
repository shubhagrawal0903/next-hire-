'use server'

import prisma from '@/lib/prisma'

export type DashboardStats = {
    totalApps: number;
    totalJobs: number;
    atsProcessed: number;
    appsByStatus: { name: string; value: number }[];
    appsByJob: { name: string; applications: number }[];
}

export async function getDashboardStats(companyId: string): Promise<DashboardStats> {
    if (!companyId) {
        throw new Error('Company ID is required');
    }

    try {
        // 1. Total Applications
        const totalApps = await prisma.application.count({
            where: {
                job: {
                    companyId: companyId
                }
            }
        });

        // 2. Total Jobs
        const totalJobs = await prisma.job.count({
            where: {
                companyId: companyId
            }
        });

        // 3. ATS Processed (Assuming atsScore > 0 means processed)
        const atsProcessed = await prisma.application.count({
            where: {
                job: {
                    companyId: companyId
                },
                atsScore: {
                    gt: 0
                }
            }
        });

        // 4. Applications by Status
        const statusGroups = await prisma.application.groupBy({
            by: ['status'],
            where: {
                job: {
                    companyId: companyId
                }
            },
            _count: {
                status: true
            }
        });

        // Normalize to uppercase and merge duplicates caused by mixed-case DB values
        const statusMap = statusGroups.reduce<Record<string, number>>((acc, group) => {
            const status = group.status.toUpperCase();
            acc[status] = (acc[status] ?? 0) + group._count.status;
            return acc;
        }, {});
        const appsByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

        // 5. Top Jobs (Applications per Job)
        const jobsWithApps = await prisma.job.findMany({
            where: {
                companyId: companyId
            },
            select: {
                title: true,
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy: {
                applications: {
                    _count: 'desc'
                }
            },
            take: 5 // Top 5 jobs
        });

        const appsByJob = jobsWithApps.map(job => ({
            name: job.title,
            applications: job._count.applications
        }));

        return {
            totalApps,
            totalJobs,
            atsProcessed,
            appsByStatus,
            appsByJob
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard statistics');
    }
}
