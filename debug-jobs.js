
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const jobs = await prisma.job.findMany({
            select: {
                id: true,
                title: true,
                requirements: true,
            },
        });

        console.log('--- Job Requirements Debug ---');
        if (jobs.length === 0) {
            console.log('No jobs found.');
        } else {
            jobs.forEach(job => {
                console.log(`Job: "${job.title}" (ID: ${job.id})`);
                console.log(`Requirements (${job.requirements.length}):`, job.requirements);
                console.log('-----------------------------------');
            });
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
