// Run this script to clean up orphaned jobs (jobs without valid companies)
// Usage: node cleanup-orphaned-jobs.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOrphanedJobs() {
  try {
    console.log('Starting cleanup of orphaned jobs...');

    // Find all jobs with just their companyId (don't include company to avoid error)
    const allJobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        companyId: true,
      },
    });

    console.log(`Total jobs found: ${allJobs.length}`);

    // Find orphaned jobs (where companyId is null)
    const orphanedJobs = allJobs.filter(job => job.companyId === null);

    console.log(`Orphaned jobs found: ${orphanedJobs.length}`);

    if (orphanedJobs.length > 0) {
      console.log('Deleting orphaned jobs...');
      
      const orphanedJobIds = orphanedJobs.map(job => job.id);
      
      const deleteResult = await prisma.job.deleteMany({
        where: {
          id: {
            in: orphanedJobIds,
          },
        },
      });

      console.log(`✅ Deleted ${deleteResult.count} orphaned jobs`);
    } else {
      console.log('✅ No orphaned jobs found. Database is clean!');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedJobs();
