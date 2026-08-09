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
  daysPerWeek: z.number().min(1).max(7),
  deadline: z.string().min(2).max(100),
  learningStyle: z.enum(["Visual", "Auditory", "Reading/Writing", "Kinesthetic", "Mixed"]),
  topics: z.string().max(1000).optional(),
  currentStrengths: z.string().max(1000).optional(),
  currentWeaknesses: z.string().max(1000).optional(),
  examName: z.string().max(200).optional(),
  examDate: z.string().max(100).optional(),
  existingResources: z.string().max(1000).optional(),
});

export const StudyPlannerOutputSchema = z.object({
  overallStrategy: z.string().describe("High-level summary of how to approach studying this subject"),
  weeklyGoals: z.array(z.string()).describe("Goals to achieve on a weekly basis"),
  dailyTasks: z.array(
    z.object({
      day: z.string(),
      tasks: z.array(z.string()),
    })
  ).describe("Daily task breakdown for a typical week"),
  topicSequence: z.array(z.string()).describe("Logical sequence of topics to cover"),
  revisionSchedule: z.string().describe("Strategy and schedule for revision"),
  practiceTasks: z.array(z.string()).describe("Suggested practical exercises or tasks"),
  reviewCheckpoints: z.array(z.string()).describe("Milestones to check progress"),
  progressChecklist: z.array(z.string()).describe("A flat checklist of all major items to complete"),
});

const StudyPlannerPrompt = (input: z.infer<typeof StudyPlannerInputSchema>) => `
You are an expert academic tutor and learning strategist.
Create a comprehensive, structured study plan based on:

Subject: ${input.subject}
Goal: ${input.goal}
Current Level: ${input.currentLevel}
Available Hours per Day: ${input.availableHours}
Days Available per Week: ${input.daysPerWeek}
Deadline/Timeframe: ${input.deadline}
Learning Style: ${input.learningStyle}
Specific Topics to Cover: ${input.topics || "Not provided"}
Current Strengths: ${input.currentStrengths || "Not provided"}
Current Weaknesses: ${input.currentWeaknesses || "Not provided"}
Exam Name: ${input.examName || "Not provided"}
Exam Date: ${input.examDate || "Not provided"}
Existing Resources: ${input.existingResources || "Not provided"}

Rules:
1. Create a realistic and actionable daily and weekly routine considering days and hours available.
2. Address their weaknesses and utilize their strengths.
3. If the user asks for resources but none are provided, suggest general resource TYPES or categories, without pretending specific links or facts have been verified.
4. Ensure tasks in "progressChecklist" are actionable items they can check off.
5. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 7. JOB DESCRIPTION GENERATOR
// --------------------------------------------------------

export const JobDescriptionInputSchema = z.object({
  jobTitle: z.string().min(2).max(100),
  department: z.string().max(100).optional(),
  experienceLevel: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  employmentType: z.string().max(50).optional(),
  skills: z.string().max(1000).optional(),
  responsibilities: z.string().max(2000).optional(),
  companyDescription: z.string().max(1000).optional(),
  salary: z.string().max(100).optional(),
});

export const JobDescriptionOutputSchema = z.object({
  jobSummary: z.string().describe("A brief, engaging overview of the role"),
  responsibilities: z.array(z.string()).describe("List of key responsibilities"),
  requiredQualifications: z.array(z.string()).describe("List of must-have qualifications"),
  preferredQualifications: z.array(z.string()).describe("List of nice-to-have qualifications"),
  skills: z.array(z.string()).describe("Key hard and soft skills required"),
  benefits: z.array(z.string()).describe("List of benefits (only include if provided or standard generic ones)"),
  applicationInstructions: z.string().describe("Brief instructions on how to apply"),
});

const JobDescriptionPrompt = (input: z.infer<typeof JobDescriptionInputSchema>) => `
You are an expert HR professional and technical recruiter.
Write a compelling, professional Job Description based on the following:

Job Title: ${input.jobTitle}
Department: ${input.department || "Not provided"}
Experience Level: ${input.experienceLevel || "Not provided"}
Location: ${input.location || "Not provided"}
Employment Type: ${input.employmentType || "Not provided"}
Skills Required: ${input.skills || "Not provided"}
Responsibilities (Draft): ${input.responsibilities || "Not provided"}
Company Description: ${input.companyDescription || "Not provided"}
Salary: ${input.salary || "Not provided"}

Rules:
1. Do NOT invent company facts, specific salaries, or strict qualifications unless provided or heavily implied by the job title and experience level.
2. Structure the output clearly according to the JSON schema.
3. Keep the tone professional, inclusive, and encouraging.
4. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 8. CLIENT PROPOSAL GENERATOR
// --------------------------------------------------------

export const ProposalInputSchema = z.object({
  clientName: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  projectName: z.string().min(2).max(200),
  projectRequirements: z.string().min(10).max(2000),
  problem: z.string().max(1000).optional(),
  proposedSolution: z.string().max(2000).optional(),
  services: z.string().max(1000).optional(),
  deliverables: z.string().max(1000).optional(),
  timeline: z.string().max(500).optional(),
  budget: z.string().max(500).optional(),
  paymentTerms: z.string().max(500).optional(),
});

export const ProposalOutputSchema = z.object({
  executiveSummary: z.string().describe("High-level summary of the proposal"),
  clientProblem: z.string().describe("Detailed articulation of the client's problem/needs"),
  proposedSolution: z.string().describe("How the proposed services solve the problem"),
  scope: z.array(z.string()).describe("List of what is included in the project scope"),
  deliverables: z.array(z.string()).describe("Specific, tangible deliverables"),
  timeline: z.array(z.object({ phase: z.string(), duration: z.string(), description: z.string() })),
  pricing: z.array(z.object({ item: z.string(), cost: z.string() })),
  terms: z.array(z.string()).describe("List of terms and conditions or payment terms"),
  nextSteps: z.string().describe("Call to action for the client"),
});

const ProposalPrompt = (input: z.infer<typeof ProposalInputSchema>) => `
You are an expert B2B consultant and sales professional.
Write a comprehensive, persuasive client proposal based on:

Client Name: ${input.clientName}
Company: ${input.company || "Not provided"}
Project Name: ${input.projectName}
Project Requirements: ${input.projectRequirements}
Client Problem: ${input.problem || "Not provided"}
Proposed Solution: ${input.proposedSolution || "Not provided"}
Services Offered: ${input.services || "Not provided"}
Deliverables: ${input.deliverables || "Not provided"}
Timeline Details: ${input.timeline || "Not provided"}
Budget/Pricing: ${input.budget || "Not provided"}
Payment Terms: ${input.paymentTerms || "Not provided"}

Rules:
1. Do not invent client facts or scope that completely deviates from the input.
2. If Timeline or Pricing is vague, generate a reasonable generic structure based on the project type, but note that it is an estimate.
3. Make the language professional, authoritative, and persuasive.
4. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 9. SOCIAL MEDIA CALENDAR
// --------------------------------------------------------

export const SocialCalendarInputSchema = z.object({
  business: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  audience: z.string().max(200).optional(),
  platform: z.enum(["LinkedIn", "Instagram", "Facebook", "X/Twitter", "Mixed"]),
  goal: z.string().min(2).max(200),
  postingFrequency: z.string().max(100).optional(),
  dateRange: z.string().max(100).optional(),
  tone: z.string().max(100).optional(),
});

export const SocialCalendarOutputSchema = z.object({
  strategySummary: z.string().describe("Brief overview of the content strategy"),
  calendar: z.array(
    z.object({
      dayOrDate: z.string(),
      platform: z.string(),
      topic: z.string(),
      contentType: z.string(),
      hook: z.string(),
      caption: z.string(),
      cta: z.string(),
      hashtags: z.array(z.string()),
    })
  ).describe("Array of individual social media posts"),
});

const SocialCalendarPrompt = (input: z.infer<typeof SocialCalendarInputSchema>) => `
You are an expert Social Media Manager and Content Strategist.
Create a detailed social media content calendar based on:

Business/Brand: ${input.business}
Industry: ${input.industry}
Target Audience: ${input.audience || "Not provided"}
Platform: ${input.platform}
Primary Goal: ${input.goal}
Frequency: ${input.postingFrequency || "3 times a week"}
Date Range/Duration: ${input.dateRange || "1 Week"}
Tone of Voice: ${input.tone || "Professional yet engaging"}

Rules:
1. Generate high-quality, engaging posts that align with the platform's best practices (e.g., short for X, visual/aesthetic for Instagram, professional for LinkedIn).
2. Ensure a good mix of content types (e.g., educational, promotional, engaging).
3. Do not claim guaranteed viral results in the output text.
4. Generate enough posts to satisfy the frequency and duration. (Limit to max 14 posts).
5. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 10. STARTUP IDEA VALIDATOR
// --------------------------------------------------------

export const StartupValidatorInputSchema = z.object({
  idea: z.string().min(10).max(1000),
  targetCustomer: z.string().min(2).max(500),
  problem: z.string().min(10).max(1000),
  proposedSolution: z.string().min(10).max(1000),
  businessModel: z.string().max(500).optional(),
  competitors: z.string().max(500).optional(),
});

export const StartupValidatorOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall viability score out of 100"),
  summary: z.string().describe("Executive summary of the AI's analysis"),
  problemStrength: z.object({ score: z.number().min(0).max(10), analysis: z.string() }),
  customerClarity: z.object({ score: z.number().min(0).max(10), analysis: z.string() }),
  valueProposition: z.object({ score: z.number().min(0).max(10), analysis: z.string() }),
  competitionAnalysis: z.string().describe("Analysis of provided or inferred competitors"),
  risks: z.array(z.string()).describe("Key risks and challenges"),
  mvpFeatures: z.array(z.string()).describe("Recommended features for a Minimum Viable Product"),
  businessModelSuggestions: z.array(z.string()),
  goToMarketIdeas: z.array(z.string()),
  validationQuestions: z.array(z.string()).describe("Questions the founder must answer or ask customers"),
  nextSteps: z.array(z.string()),
});

const StartupValidatorPrompt = (input: z.infer<typeof StartupValidatorInputSchema>) => `
You are an expert Startup Advisor, VC Analyst, and Product Manager.
Evaluate and validate the following startup idea:

Idea: ${input.idea}
Target Customer: ${input.targetCustomer}
Problem Being Solved: ${input.problem}
Proposed Solution: ${input.proposedSolution}
Business Model: ${input.businessModel || "Not provided"}
Competitors: ${input.competitors || "None listed"}

Rules:
1. Provide a highly critical, realistic, and objective analysis.
2. Clearly distinguish between your AI reasoning and verified external facts (do not fabricate market statistics; rely on general reasoning).
3. Score the idea fairly. Do not give a 100/100 just to be nice. If it's highly saturated or has weak margins, score it lower.
4. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 11. GITHUB README GENERATOR
// --------------------------------------------------------

export const GithubReadmeInputSchema = z.object({
  projectName: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  projectType: z.string().max(100).optional(),
  techStack: z.string().max(500).optional(),
  features: z.string().max(1000).optional(),
  installation: z.string().max(1000).optional(),
  usage: z.string().max(1000).optional(),
  envVars: z.string().max(1000).optional(),
  apiInfo: z.string().max(1000).optional(),
  deployment: z.string().max(1000).optional(),
  contribution: z.string().max(1000).optional(),
  license: z.string().max(100).optional(),
});

export const GithubReadmeOutputSchema = z.object({
  markdown: z.string().describe("The complete, fully formatted raw Markdown for the README.md file"),
});

const GithubReadmePrompt = (input: z.infer<typeof GithubReadmeInputSchema>) => `
You are an expert Developer Advocate and Open Source maintainer.
Generate a highly professional, structured README.md for the following project.

Project Name: ${input.projectName}
Description: ${input.description}
Project Type: ${input.projectType || "Not provided"}
Tech Stack: ${input.techStack || "Not provided"}
Features: ${input.features || "Not provided"}
Installation Steps: ${input.installation || "Not provided"}
Usage Information: ${input.usage || "Not provided"}
Environment Variables: ${input.envVars || "Not provided"}
API Information: ${input.apiInfo || "Not provided"}
Deployment: ${input.deployment || "Not provided"}
Contribution Instructions: ${input.contribution || "Not provided"}
License: ${input.license || "Not provided"}

Rules:
1. ONLY use information provided. Do NOT invent features, API endpoints, or environment variables.
2. If information for a section is missing (e.g., Installation), use a clear placeholder like "*(Add installation steps here)*" rather than fabricating it.
3. Structure the README with standard sections: Title, Description, Screenshots placeholder, Features, Tech Stack, Installation, Environment Configuration, Usage, API Documentation (if applicable), Project Structure (placeholder if needed), Deployment, Contributing, License.
4. Use professional markdown formatting (headers, code blocks, lists).
5. Return ONLY valid JSON matching the schema, with the entire markdown string in the 'markdown' field.
`;

// --------------------------------------------------------
// 12. BUG REPORT GENERATOR
// --------------------------------------------------------

export const BugReportInputSchema = z.object({
  description: z.string().min(10).max(2000),
  steps: z.string().max(2000).optional(),
  expected: z.string().max(1000).optional(),
  actual: z.string().max(1000).optional(),
  browser: z.string().max(100).optional(),
  device: z.string().max(100).optional(),
  os: z.string().max(100).optional(),
  version: z.string().max(100).optional(),
  logs: z.string().max(5000).optional(),
});

export const BugReportOutputSchema = z.object({
  title: z.string().describe("Clear, concise bug title"),
  summary: z.string().describe("Brief summary of the issue"),
  description: z.string().describe("Detailed description of the bug"),
  stepsToReproduce: z.array(z.string()).describe("Ordered list of steps to reproduce"),
  expectedResult: z.string(),
  actualResult: z.string(),
  environment: z.array(z.string()).describe("List of environment details (browser, OS, etc.)"),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  possibleCauses: z.array(z.string()).describe("Hypothesized possible causes"),
  investigationSteps: z.array(z.string()).describe("Suggested steps to investigate the issue"),
  additionalInfoNeeded: z.array(z.string()).describe("Any missing information that would help debug"),
});

const BugReportPrompt = (input: z.infer<typeof BugReportInputSchema>) => `
You are an expert QA Engineer and Senior Developer.
Convert the following messy bug description into a structured, professional bug report.

Raw Bug Description: ${input.description}
Steps Provided: ${input.steps || "Not provided"}
Expected Behavior: ${input.expected || "Not provided"}
Actual Behavior: ${input.actual || "Not provided"}
Browser: ${input.browser || "Not provided"}
Device: ${input.device || "Not provided"}
OS: ${input.os || "Not provided"}
App Version: ${input.version || "Not provided"}
Console/Logs: ${input.logs || "Not provided"}

Rules:
1. Do NOT claim a confirmed root cause unless the provided logs/info absolutely prove it. Use language like "Possible cause" or "Suggested investigation".
2. Do not fabricate logs, technical details, or environment specifics. If missing, note it in 'additionalInfoNeeded'.
3. Assign an appropriate Severity and Priority based on standard software engineering practices.
4. Format the output clearly.
5. Return ONLY valid JSON matching the schema.
`;

// --------------------------------------------------------
// 13. MEETING SUMMARIZER
// --------------------------------------------------------

export const MeetingSummarizerInputSchema = z.object({
  title: z.string().min(2).max(200),
  date: z.string().max(100).optional(),
  transcript: z.string().min(10).max(25000),
});

export const MeetingSummarizerOutputSchema = z.object({
  summary: z.string().describe("High-level summary of the meeting"),
  keyPoints: z.array(z.string()).describe("Key discussion points"),
  decisions: z.array(z.string()).describe("Any decisions made"),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string().optional().describe("Owner of the task, if explicitly identifiable"),
      deadline: z.string().optional().describe("Deadline, if explicitly identifiable"),
    })
  ).describe("Action items with optional owners and deadlines"),
  openQuestions: z.array(z.string()).describe("Unresolved questions"),
  followUps: z.array(z.string()).describe("Next steps or follow-ups"),
});

const MeetingSummarizerPrompt = (input: z.infer<typeof MeetingSummarizerInputSchema>) => `
You are an expert executive assistant.
Summarize the following meeting transcript/notes into a highly structured format.

Meeting Title: ${input.title}
Meeting Date: ${input.date || "Not provided"}

TRANSCRIPT / NOTES:
${input.transcript}

Rules:
1. Extract clear, concise key points.
2. For action items, ONLY extract owners and deadlines if they are clearly stated in the text. Do NOT invent or guess them. If not specified, leave them empty or omit them.
3. Do NOT invent attendees, decisions, or facts that were not in the transcript.
4. Return ONLY valid JSON matching the schema.
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
    category: "LEARNING",
    description: "Create personalized study plans and schedules.",
    icon: "GraduationCap",
    inputSchema: StudyPlannerInputSchema,
    outputSchema: StudyPlannerOutputSchema,
    systemPrompt: StudyPlannerPrompt,
    planRequirement: "FREE",
  },
  "job-description": {
    id: "job-description",
    name: "Job Description",
    category: "BUSINESS",
    description: "Generate professional job descriptions.",
    icon: "BriefcaseBusiness",
    inputSchema: JobDescriptionInputSchema,
    outputSchema: JobDescriptionOutputSchema,
    systemPrompt: JobDescriptionPrompt,
    planRequirement: "FREE",
  },
  "proposal": {
    id: "proposal",
    name: "Proposal Generator",
    category: "BUSINESS",
    description: "Create persuasive client proposals and contracts.",
    icon: "Handshake",
    inputSchema: ProposalInputSchema,
    outputSchema: ProposalOutputSchema,
    systemPrompt: ProposalPrompt,
    planRequirement: "FREE",
  },
  "social-calendar": {
    id: "social-calendar",
    name: "Social Calendar",
    category: "BUSINESS",
    description: "Generate structured social media content calendars.",
    icon: "CalendarDays",
    inputSchema: SocialCalendarInputSchema,
    outputSchema: SocialCalendarOutputSchema,
    systemPrompt: SocialCalendarPrompt,
    planRequirement: "FREE",
  },
  "startup-validator": {
    id: "startup-validator",
    name: "Startup Validator",
    category: "BUSINESS",
    description: "Evaluate your startup idea with AI VC analysis.",
    icon: "Rocket",
    inputSchema: StartupValidatorInputSchema,
    outputSchema: StartupValidatorOutputSchema,
    systemPrompt: StartupValidatorPrompt,
    planRequirement: "FREE",
  },
  "github-readme": {
    id: "github-readme",
    name: "GitHub README Generator",
    category: "DEVELOPER",
    description: "Generate professional README.md for your projects.",
    icon: "Github",
    inputSchema: GithubReadmeInputSchema,
    outputSchema: GithubReadmeOutputSchema,
    systemPrompt: GithubReadmePrompt,
    planRequirement: "FREE",
  },
  "bug-report": {
    id: "bug-report",
    name: "Bug Report Generator",
    category: "DEVELOPER",
    description: "Convert messy descriptions into structured bug reports.",
    icon: "Bug",
    inputSchema: BugReportInputSchema,
    outputSchema: BugReportOutputSchema,
    systemPrompt: BugReportPrompt,
    planRequirement: "FREE",
  },
  "meeting-summarizer": {
    id: "meeting-summarizer",
    name: "Meeting Summarizer",
    category: "PRODUCTIVITY",
    description: "Convert chaotic meeting transcripts into structured summaries.",
    icon: "Users",
    inputSchema: MeetingSummarizerInputSchema,
    outputSchema: MeetingSummarizerOutputSchema,
    systemPrompt: MeetingSummarizerPrompt,
    planRequirement: "FREE",
  },
};
