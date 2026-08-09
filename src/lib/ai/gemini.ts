import { GoogleGenAI, Type, Schema } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Initialize Gemini SDK safely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build",
});

export async function generateStructuredOutput<T>(
  systemInstruction: string,
  prompt: string,
  zodSchema: z.ZodType<T>,
  modelName: string = "gemini-2.5-flash"
): Promise<T> {
  if (process.env.GEMINI_API_KEY === undefined || process.env.GEMINI_API_KEY === "dummy-key-for-build") {
    throw new Error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
  }

  // Convert Zod schema to JSON schema format compatible with Gemini Structured Outputs
  const jsonSchema = zodToJsonSchema(zodSchema, { target: "jsonSchema7" }) as any;
  
  // Need to strip some fields that Gemini's strict OpenAPI parsing might reject
  if (jsonSchema.$schema) delete jsonSchema.$schema;
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        // Note: For full strictness, one would convert jsonSchema to GoogleGenAI Schema object.
        // The Node SDK accepts standard JSON Schema under responseSchema in most recent versions.
        responseSchema: jsonSchema as Schema,
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    // Parse and validate the response against the Zod schema to be absolutely sure
    const parsedData = JSON.parse(text);
    return zodSchema.parse(parsedData);
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate AI response. Please try again.");
  }
}
