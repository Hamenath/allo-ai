import { z } from "zod";

export type ToolCategory = "CAREER" | "BUSINESS" | "DEVELOPER" | "PRODUCTIVITY" | "LEARNING" | "CONTENT";

export interface AITool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string; // lucide-react icon name string
  inputSchema: z.ZodType<any>;
  outputSchema: z.ZodType<any>;
  systemPrompt: (input: any) => string;
  planRequirement: "FREE" | "PRO" | "BUSINESS";
}

// --------------------------------------------------------
// 1. RESUME ANALYZER (Existing)
// --------------------------------------------------------

export const ResumeAnalyzerInputSchema = z.object({
  resume: z.string().min(50, "Resume must be at least 50 characters").max(20000, "Resume is too long"),
  jobDescription: z.string().min(20, "Job description must be at least 20 characters").max(10000, "Job description is too long"),
});

export const ResumeAnalyzerOutputSchema = z.object({
  atsScore: z.number().min(0).max(100).describe("Estimated ATS compatibility score"),
  jobMatchScore: z.number().min(0).max(100).describe("How well the resume matches the job description"),
  strengths: z.array(z.string()).describe("Key strengths found in the resume"),
  weaknesses: z.array(z.string()).describe("Weaknesses or areas lacking in the resume"),
  matchedSkills: z.array(z.string()).describe("Skills from the job description that are present in the resume"),
  missingSkills: z.array(z.string()).describe("Important skills from the job description missing in the resume"),
  missingKeywords: z.array(z.string()).describe("Important keywords missing for ATS optimization"),
  recommendations: z.array(z.string()).describe("General recommendations for improvement"),
  resumeImprovements: z.array(z.string()).describe("Specific lines or sections to improve"),
  interviewQuestions: z.array(z.string()).describe("Potential interview questions based on the resume and job description gap"),
});

const ResumeAnalyzerPrompt = (input: z.infer<typeof ResumeAnalyzerInputSchema>) => `
You are an expert technical recruiter and ATS software simulator.
Analyze the provided Resume against the provided Job Description.
Provide a highly critical, accurate assessment. 
Do not hallucinate skills they do not have.
Return ONLY valid JSON matching the exact schema requested.

RESUME:
${input.resume}

JOB DESCRIPTION:
${input.jobDescription}
`;

// --------------------------------------------------------
// 2. INTERVIEW QUESTION GENERATOR
// --------------------------------------------------------

export const InterviewGeneratorInputSchema = z.object({
  jobTitle: z.string().min(2).max(100),
  experienceLevel: z.string().min(2).max(50),
  skills: z.string().max(500).optional(),
  jobDescription: z.string().max(5000).optional(),
  interviewType: z.enum(["Technical", "Behavioral", "HR", "System Design", "Mixed"]),
});

const QuestionSchema = z.object({
  question: z.string(),
  suggestedAnswer: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.string(),
});

export const InterviewGeneratorOutputSchema = z.object({
  technicalQuestions: z.array(QuestionSchema),
  behavioralQuestions: z.array(QuestionSchema),
  hrQuestions: z.array(QuestionSchema),
  systemDesignQuestions: z.array(QuestionSchema),
});

const InterviewGeneratorPrompt = (input: z.infer<typeof InterviewGeneratorInputSchema>) => `
You are an expert technical interviewer and hiring manager.
Generate a comprehensive list of interview questions for a candidate applying for the following role:

Job Title: ${input.jobTitle}
Experience Level: ${input.experienceLevel}
Skills: ${input.skills || "Not provided"}
Job Description: ${input.jobDescription || "Not provided"}
Interview Type: ${input.interviewType}

Rules:
1. Generate high-quality, realistic questions appropriate for the experience level.
2. Provide a "suggestedAnswer" that outlines the key points a good candidate should hit (bullet points are fine).
3. If the interview type is specific (e.g., "Technical"), focus heavily on that, but if "Mixed", provide a good balance.
4. If "System Design" is not relevant to the role, you can leave that array empty.
5. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 3. LINKEDIN POST GENERATOR
// --------------------------------------------------------

export const LinkedinGeneratorInputSchema = z.object({
  topic: z.string().min(10).max(500),
  audience: z.string().min(2).max(100),
  goal: z.string().min(2).max(200),
  tone: z.enum(["Professional", "Friendly", "Storytelling", "Thought leadership", "Casual"]),
  postType: z.enum(["Career update", "Educational", "Personal story", "Hiring", "Product announcement", "Achievement", "Industry insight"]),
});

export const LinkedinGeneratorOutputSchema = z.object({
  variations: z.array(
    z.object({
      hook: z.string().describe("Attention-grabbing first line"),
      mainContent: z.string().describe("The body of the post, properly spaced"),
      cta: z.string().describe("Call to action at the end"),
      hashtags: z.array(z.string()).describe("List of suggested hashtags without the # symbol"),
    })
  ).length(3).describe("Exactly 3 variations of the post"),
});

const LinkedinGeneratorPrompt = (input: z.infer<typeof LinkedinGeneratorInputSchema>) => `
You are an expert LinkedIn ghostwriter and personal branding strategist.
Write 3 variations of a LinkedIn post based on the following:

Topic: ${input.topic}
Target Audience: ${input.audience}
Goal of Post: ${input.goal}
Tone: ${input.tone}
Post Type: ${input.postType}

Rules:
1. Optimize for readability with short paragraphs and impactful statements.
2. The Hook must be engaging and make people click "...see more".
3. The Main Content should flow naturally and deliver value.
4. Provide a clear Call to Action (CTA).
5. Generate exactly 3 distinct variations (e.g., different angles or lengths).
6. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 4. COLD EMAIL GENERATOR
// --------------------------------------------------------

export const ColdEmailGeneratorInputSchema = z.object({
  recipientType: z.string().min(2).max(100),
  recipientName: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  purpose: z.string().min(10).max(1000),
  userBackground: z.string().max(1000).optional(),
  offerInfo: z.string().max(1000).optional(),
  tone: z.enum(["Professional", "Direct", "Friendly", "Persuasive"]),
});

export const ColdEmailGeneratorOutputSchema = z.object({
  subjectLines: z.array(z.string()).length(3),
  fullEmail: z.string().describe("A comprehensive, highly personalized cold email"),
  shortEmail: z.string().describe("A concise, direct-to-the-point version"),
  followUpEmail: z.string().describe("A polite follow-up email to send a few days later"),
});

const ColdEmailGeneratorPrompt = (input: z.infer<typeof ColdEmailGeneratorInputSchema>) => `
You are an expert B2B copywriter and sales strategist.
Write a high-converting cold outreach email sequence based on:

Recipient Type/Role: ${input.recipientType}
Recipient Name: ${input.recipientName || "Not provided (use generic greeting)"}
Company: ${input.company || "Not provided"}
Purpose of Email: ${input.purpose}
Sender's Background: ${input.userBackground || "Not provided"}
Product/Service/Offer: ${input.offerInfo || "Not provided"}
Tone: ${input.tone}

Rules:
1. Avoid spammy language or overly salesy buzzwords.
2. Focus on the recipient's potential pain points and value proposition.
3. Keep the "shortEmail" under 100 words.
4. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 5. COVER LETTER GENERATOR
// --------------------------------------------------------

export const CoverLetterGeneratorInputSchema = z.object({
  resume: z.string().min(50).max(20000),
  company: z.string().min(2).max(100),
  jobTitle: z.string().min(2).max(100),
  jobDescription: z.string().max(10000).optional(),
  tone: z.enum(["Professional", "Confident", "Enthusiastic", "Direct"]),
});

export const CoverLetterGeneratorOutputSchema = z.object({
  opening: z.string().describe("Strong opening paragraph hooking the reader"),
  relevantExperience: z.string().describe("1-2 paragraphs highlighting the most relevant experience from the resume"),
  companyAlignment: z.string().describe("Paragraph connecting the candidate's values/skills to the company/job"),
  closing: z.string().describe("Professional call to action and sign-off"),
});

const CoverLetterGeneratorPrompt = (input: z.infer<typeof CoverLetterGeneratorInputSchema>) => `
You are an expert career coach and executive resume writer.
Write a customized cover letter for the following application:

Target Company: ${input.company}
Target Job Title: ${input.jobTitle}
Tone: ${input.tone}

RESUME:
${input.resume}

JOB DESCRIPTION:
${input.jobDescription || "Not provided"}

Rules:
1. DO NOT invent experience, qualifications, achievements, or company information that wasn't provided. 
2. Use ONLY information available in the user's resume.
3. Make it compelling, professional, and tailored to the job description if provided.
4. Output the letter split into the semantic sections defined in the schema.
5. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 6. STUDY PLANNER
// --------------------------------------------------------

export const StudyPlannerInputSchema = z.object({
  subject: z.string().min(2).max(200),
  goal: z.string().min(10).max(500),
  currentLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  availableHours: z.number().min(1).max(16),
  deadline: z.string().min(2).max(100),
  learningStyle: z.enum(["Visual", "Auditory", "Reading/Writing", "Kinesthetic", "Mixed"]),
  topics: z.string().max(1000).optional(),
});

export const StudyPlannerOutputSchema = z.object({
  overallStrategy: z.string().describe("High-level summary of how to approach studying this subject"),
  dailySchedule: z.array(
    z.object({
      timeBlock: z.string(),
      activity: z.string(),
      focus: z.string(),
    })
  ),
  weeklyGoals: z.array(z.string()),
  topicsBreakdown: z.array(
    z.object({
      topic: z.string(),
      difficulty: z.string(),
      estimatedHours: z.number(),
    })
  ),
  revisionSchedule: z.string(),
  practiceTasks: z.array(z.string()),
  progressChecklist: z.array(z.string()),
});

const StudyPlannerPrompt = (input: z.infer<typeof StudyPlannerInputSchema>) => `
You are an expert academic tutor and learning strategist.
Create a comprehensive, structured study plan based on:

Subject: ${input.subject}
Goal: ${input.goal}
Current Level: ${input.currentLevel}
Available Hours per Day: ${input.availableHours}
Deadline/Timeframe: ${input.deadline}
Learning Style: ${input.learningStyle}
Specific Topics to Cover: ${input.topics || "Not provided"}

Rules:
1. Create a realistic and actionable daily and weekly routine.
2. Tailor the suggested activities to the user's learning style.
3. Do not invent specific external links/books unless explicitly asked, but you can suggest general resource types.
4. Ensure the total estimated hours in topics Breakdown makes sense with their daily availability.
5. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// REGISTRY EXPORT
// --------------------------------------------------------

export const toolsRegistry: Record<string, AITool> = {
  "resume-analyzer": {
    id: "resume-analyzer",
    name: "Resume Analyzer",
    category: "CAREER",
    description: "Optimize your resume for ATS and specific jobs.",
    icon: "FileText",
    inputSchema: ResumeAnalyzerInputSchema,
    outputSchema: ResumeAnalyzerOutputSchema,
    systemPrompt: ResumeAnalyzerPrompt,
    planRequirement: "FREE",
  },
  "interview-generator": {
    id: "interview-generator",
    name: "Interview Generator",
    category: "CAREER",
    description: "Practice with AI-generated tailored interview questions.",
    icon: "Briefcase",
    inputSchema: InterviewGeneratorInputSchema,
    outputSchema: InterviewGeneratorOutputSchema,
    systemPrompt: InterviewGeneratorPrompt,
    planRequirement: "FREE",
  },
  "linkedin-generator": {
    id: "linkedin-generator",
    name: "LinkedIn Generator",
    category: "CAREER",
    description: "Generate highly engaging LinkedIn posts and updates.",
    icon: "Linkedin", // Assuming standard lucide icon usage (will use a generic one if missing)
    inputSchema: LinkedinGeneratorInputSchema,
    outputSchema: LinkedinGeneratorOutputSchema,
    systemPrompt: LinkedinGeneratorPrompt,
    planRequirement: "FREE",
  },
  "cold-email": {
    id: "cold-email",
    name: "Cold Email Generator",
    category: "CAREER", // Placed in Career for now as per instructions "Career category should contain... Cold Email Generator"
    description: "Generate high-converting cold outreach emails.",
    icon: "Mail",
    inputSchema: ColdEmailGeneratorInputSchema,
    outputSchema: ColdEmailGeneratorOutputSchema,
    systemPrompt: ColdEmailGeneratorPrompt,
    planRequirement: "FREE",
  },
  "cover-letter": {
    id: "cover-letter",
    name: "Cover Letter Generator",
    category: "CAREER",
    description: "Write customized cover letters instantly.",
    icon: "FileSignature",
    inputSchema: CoverLetterGeneratorInputSchema,
    outputSchema: CoverLetterGeneratorOutputSchema,
    systemPrompt: CoverLetterGeneratorPrompt,
    planRequirement: "FREE",
  },
  "study-planner": {
    id: "study-planner",
    name: "Study Planner",
    category: "CAREER", // Instructions put this in Career category list
    description: "Create personalized study plans and schedules.",
    icon: "GraduationCap",
    inputSchema: StudyPlannerInputSchema,
    outputSchema: StudyPlannerOutputSchema,
    systemPrompt: StudyPlannerPrompt,
    planRequirement: "FREE",
  },
};
