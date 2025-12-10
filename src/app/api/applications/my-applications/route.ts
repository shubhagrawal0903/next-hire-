import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

    // Fetch all applications submitted by the logged-in user
    // Only include applications where the job has a valid company
    const applications = await prisma.application.findMany({
      where: {
        userId: userId,
        job: {
          company: {
            is: {},
          },
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            employmentType: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            postedAt: true,
            status: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                industry: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent applications first
      },
    });

    // Return the list of applications
    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
