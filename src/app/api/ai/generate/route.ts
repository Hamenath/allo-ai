import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { toolsRegistry } from "@/lib/ai/registry";
import { generateStructuredOutput } from "@/lib/ai/gemini";
import { checkUsage, incrementUsage, saveServerGeneration } from "@/lib/db/usage";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user via Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid token" } }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    
    let decodedToken;
    try {
      if (!adminAuth) throw new Error("adminAuth not initialized");
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      // In development if credentials are missing, we might mock this or fail cleanly.
      // We will fail cleanly.
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid authentication token. Ensure Firebase credentials are set." } }, { status: 401 });
    }
    
    const userId = decodedToken.uid;

    // 2. Parse request body
    const body = await req.json();
    const { toolId, input } = body;

    if (!toolId || !toolsRegistry[toolId]) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Tool not found" } }, { status: 404 });
    }

    const tool = toolsRegistry[toolId];

    // 3. Validate input with Zod
    const validationResult = tool.inputSchema.safeParse(input);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid input", details: validationResult.error.errors } }, { status: 400 });
    }

    // 4. Check Usage Limits
    const usageCheck = await checkUsage(userId);
    if (!usageCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: {
          code: "USAGE_LIMIT_REACHED",
          message: "You've reached your monthly AI generation limit.",
          usage: {
            used: usageCheck.usageInfo.used,
            limit: usageCheck.usageInfo.limit,
            remaining: usageCheck.usageInfo.remaining,
          }
        }
      }, { status: 403 });
    }

    // 5. Build Prompt
    const systemInstruction = tool.systemPrompt(validationResult.data);
    const prompt = "Please process the request according to the system instructions."; // Input is embedded in system instruction for simplicity

    // 6. Execute Gemini
    let result;
    try {
      result = await generateStructuredOutput(
        systemInstruction,
        prompt,
        tool.outputSchema
      );
    } catch (error: any) {
      console.error("Gemini Error:", error);
      return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to generate AI response." } }, { status: 500 });
    }

    // 7. Save to Firestore
    const savedDocId = await saveServerGeneration({
      userId,
      toolId: tool.id,
      category: tool.category,
      title: `${tool.name} Result`, // Can be improved later to be more descriptive
      input: validationResult.data,
      output: result,
    });

    // 8. Increment Usage
    await incrementUsage(userId);

    // 9. Return structured result
    return NextResponse.json({
      success: true,
      data: {
        id: savedDocId,
        result,
        remainingUsage: usageCheck.usageInfo.remaining - 1,
      }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
