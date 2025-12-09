import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function GET(request: Request) {
  try {
    // 1. Authenticate the user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to get job recommendations." },
        { status: 401 }
      );
    }

    // 2. Fetch the user's profile to get their skills
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { skills: true },
    });

    console.log('[Recommendations] User profile:', userProfile);
    console.log('[Recommendations] Skills:', userProfile?.skills);

    // 3. If no profile or no skills, return empty array
    if (!userProfile || !userProfile.skills || userProfile.skills.length === 0) {
      console.log('[Recommendations] No skills found, returning empty array');
      return NextResponse.json([], { status: 200 });
    }

    const skills = userProfile.skills;
    console.log('[Recommendations] Matching jobs based on skills:', skills);

    // 4. Build search conditions for each skill (with case variations)
    const skillSearchConditions = skills.flatMap(skill => {
      const skillLower = skill.toLowerCase();
      const skillVariations = [skill, skillLower];
      
      // Add common variations
      if (skillLower === 'react') skillVariations.push('react.js', 'reactjs');
      if (skillLower === 'next.js') skillVariations.push('nextjs');
      if (skillLower === 'node.js') skillVariations.push('nodejs');
      if (skillLower === 'mongodb') skillVariations.push('mongo');
      if (skillLower === 'html 5' || skillLower === 'html5') skillVariations.push('html', 'html5', 'html 5');
      if (skillLower === 'javascript') skillVariations.push('js', 'es6');
      if (skillLower === 'typescript') skillVariations.push('ts');
      
      return [
        // Check if job requirements contain any variation of the skill
        {
          OR: skillVariations.map(variation => ({
            requirements: {
              hasSome: [variation],
            },
          })),
        },
        // Check if job title contains the skill (case-insensitive)
        {
          title: {
            contains: skill,
            mode: 'insensitive' as const,
          },
        },
        // Check if job description contains the skill (case-insensitive)
        {
          description: {
            contains: skill,
            mode: 'insensitive' as const,
          },
        },
      ];
    });

    // 5. Fetch matching jobs
    const recommendedJobs = await prisma.job.findMany({
      where: {
        AND: [
          // Match at least one skill condition
          {
            OR: skillSearchConditions,
          },
          // Only active jobs
          {
            status: "active",
          },
          // Exclude jobs posted by the user themselves
          {
            userId: {
              not: userId,
            },
          },
        ],
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
        postedAt: "desc",
      },
      take: 10, // Limit to top 10 recommendations
    });

    return NextResponse.json(recommendedJobs, { status: 200 });

  } catch (error) {
    console.error("Error fetching job recommendations:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch job recommendations. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
