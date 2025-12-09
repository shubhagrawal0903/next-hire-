import prisma from '@/lib/prisma'

// pdf-parse removed in favor of pdf2json

// pdf-parse removed in favor of pdf2json
const cloudinary = require('cloudinary').v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

class ApplicationService {
  /**
   * Upload resume buffer to Cloudinary using Upload Stream
   * Ensures binary data is saved correctly as a PDF file.
   */
  private async _uploadResumeToCloudinary(buffer: Buffer, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Stream is the only way to upload binary files correctly in 'raw' mode
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'resumes',
          access_mode: 'public', // Important: Ensures file is accessible
          // 🔥 Filename sanitization: Removes spaces/brackets & forces .pdf extension
          public_id: `resume_${Date.now()}_${filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
          overwrite: true,
        },
        (error: any, result: any) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error)
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
          } else {
            console.log('[Cloudinary] Upload successful:', result.secure_url)
            resolve(result.secure_url)
          }
        }
      )
      uploadStream.end(buffer)
    })
  }

  /**
   * ADVANCED ATS CALCULATION (Robust & Crash-Proof)
   * Handles special characters (C++, Node.js) and prevents -1 errors.
   */
  private async _calculateAndSaveAtsBuffer(
    applicationId: string,
    resumeBuffer: Buffer,
    jobSkills: string[]
  ): Promise<void> {
    try {
      console.log(`[ATS] Starting analysis for application ${applicationId}`);
      console.log(`[ATS] Job Skills to match:`, jobSkills);
      
      // 1. Check for empty skills
      if (!jobSkills || jobSkills.length === 0) {
        console.log(`[ATS] No skills to match - setting score to 0`);
        await prisma.application.update({
          where: { id: applicationId },
          data: { atsScore: 0, status: 'ATS_NO_SKILLS' }
        });
        return;
      }

      // 2. Parse PDF using pdf2json
      let pdfData: { text: string } | null = null;
      try {
        console.log(`[ATS] Parsing Buffer: Size=${resumeBuffer.length}, IsBuffer=${Buffer.isBuffer(resumeBuffer)}`);

        const PDFParser = require("pdf2json");
        const parser = new PDFParser(null, 1); // 1 for text content

        const text = await new Promise<string>((resolve, reject) => {
          parser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
          parser.on("pdfParser_dataReady", (pdfData: any) => {
            // Extract text from the raw data
            // pdf2json returns URL-encoded text in 'R' array of 'T' objects
            // But getRawTextContent() is a helper method on the parser instance (in some versions)
            // Or we can use the raw data.
            // Actually, parser.getRawTextContent() is the standard way.
            resolve(parser.getRawTextContent());
          });
          parser.parseBuffer(resumeBuffer);
        });

        pdfData = { text };

        // DEBUG: Log the result structure
        console.log('[ATS] PDF Text Length:', text.length);

      } catch (parseError: any) {
        const errorMsg = parseError.message || 'Unknown Error';
        console.error("[ATS] PDF Parsing Failed:", errorMsg);
        // ... rest of error handling
        const debugStatus = `ERR: ${errorMsg.substring(0, 40)}`;
        await prisma.application.update({
          where: { id: applicationId },
          data: { atsScore: 0, status: debugStatus }
        });
        return;
      }

      // 3. Check Empty Text
      if (!pdfData || !pdfData.text || pdfData.text.trim().length === 0) {
        console.warn("[ATS] Warning: PDF parsed but returned empty text (Scanned PDF?).");
        await prisma.application.update({
          where: { id: applicationId },
          data: { atsScore: 0, status: 'ATS_EMPTY_TEXT' }
        });
        return;
      }

      // 4. Advanced Normalization
      const resumeText = pdfData.text.toLowerCase().replace(/\s+/g, ' ');

      console.log(`[ATS] Extracted Text Preview: "${resumeText.substring(0, 100)}..."`);

      // 4.5. Extract actual skills from requirements (handle sentences)
      const skillKeywords = new Set<string>();
      const commonTechSkills = [
        // Programming Languages
        'html5', 'html', 'css3', 'css', 'javascript', 'js', 'es6', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift',
        // Frontend Frameworks & Libraries
        'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'angular', 'vue', 'vue.js', 'svelte', 'tailwind', 'bootstrap', 'material-ui', 'mui',
        // Backend Frameworks
        'node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'spring', 'spring boot', 'hibernate', 'fastapi', 'nestjs',
        // Databases
        'mongodb', 'mysql', 'postgresql', 'postgres', 'redis', 'sql', 'nosql', 'firebase', 'dynamodb', 'cassandra', 'oracle',
        // APIs & Architecture
        'restful', 'rest api', 'api', 'graphql', 'grpc', 'microservices', 'websocket',
        // DevOps & Cloud
        'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'vercel', 'netlify', 'heroku', 'ci/cd', 'jenkins', 'github actions', 'gitlab ci',
        // Version Control
        'git', 'github', 'gitlab', 'bitbucket',
        // Design & UI/UX
        'ui/ux', 'ui', 'ux', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'user research', 'usability testing', 'wireframing', 'prototyping', 'responsive design', 'typography',
        // Testing
        'jest', 'mocha', 'cypress', 'selenium', 'junit', 'pytest', 'testing',
        // Other
        'agile', 'scrum', 'jira', 'confluence', 'slack'
      ];

      for (const requirement of jobSkills) {
        const reqLower = requirement.toLowerCase();
        for (const tech of commonTechSkills) {
          if (reqLower.includes(tech)) {
            skillKeywords.add(tech);
          }
        }
      }

      console.log(`[ATS] Extracted ${skillKeywords.size} skills from requirements:`, Array.from(skillKeywords));

      let matchCount = 0;
      const matchedSkills: string[] = [];

      // 5. Safe Keyword Matching
      for (const skill of skillKeywords) {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');

        if (regex.test(resumeText) || resumeText.includes(skill)) {
          matchCount++;
          matchedSkills.push(skill);
        }
      }

      // 6. Score Calculation
      const totalSkills = skillKeywords.size > 0 ? skillKeywords.size : 1;
      const atsScore = Math.round((matchCount / totalSkills) * 100);

      // 7. Update Database
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          atsScore,
          // If score is 0, mark as NO_MATCH for debug, otherwise keep existing status (or set to Reviewed?)
          // Actually, let's just append debug info if 0
          status: atsScore === 0 ? 'ATS_NO_MATCH' : 'Pending'
        }
      })

      console.log(`[ATS] Success! Score: ${atsScore}% | Matched: ${matchedSkills.join(', ')}`);

    } catch (error: any) {
      console.error(`[ATS] CRITICAL SYSTEM FAILURE for ${applicationId}:`, error.message || error);

      await prisma.application.update({
        where: { id: applicationId },
        data: { atsScore: -1, status: 'ATS_CRASH' }
      })
    }
  }

  /**
   * Create application
   */
  async createApplication(data: {
    jobId: string
    userId: string
    applicantName: string
    applicantEmail: string
    resumeBuffer: Buffer
    originalFileName: string
    coverLetter?: string | null
  }) {
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      select: { id: true, requirements: true }
    })

    if (!job) throw new Error('Job not found')

    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: data.userId }
    })

    if (!userProfile) {
      console.log(`[Application] Creating UserProfile for new user ${data.userId}`)
      userProfile = await prisma.userProfile.create({
        data: {
          userId: data.userId,
          headline: data.applicantName,
          skills: [],
          experience: [],
          education: []
        }
      })
    }

    console.log(`[Application] Uploading resume for user ${data.userId}`)

    const resumeUrl = await this._uploadResumeToCloudinary(data.resumeBuffer, data.originalFileName)

    const application = await prisma.application.create({
      data: {
        job: { connect: { id: data.jobId } },
        applicant: { connect: { userId: data.userId } },
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        resumeUrl: resumeUrl,
        coverLetter: data.coverLetter || null,
        atsScore: 0
      }
    }); // Semicolon zaroori hai

    // Await ATS calculation to ensure it completes (Serverless functions may kill background tasks)
    try {
      await this._calculateAndSaveAtsBuffer(application.id, data.resumeBuffer, job.requirements || [])
    } catch (error: any) {
      console.error(`[ATS] Calculation Failed:`, error)
      // Don't throw, just log, so application is still created
    }

    return application
  }
}

export const applicationService = new ApplicationService()