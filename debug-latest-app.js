
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const app = await prisma.application.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { job: true }
        });

        if (!app) {
            console.log('No applications found.');
            return;
        }

        console.log('--- Latest Application Debug Info ---');
        console.log(`ID: ${app.id}`);
        console.log(`Status: ${app.status}`); // This should contain our debug code
        console.log(`ATS Score: ${app.atsScore}`);
        console.log(`Job Title: ${app.job.title}`);
        console.log(`Job Requirements:`, app.job.requirements);
        console.log('-------------------------------------');

    } catch (error) {
        console.error('Error fetching application:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
