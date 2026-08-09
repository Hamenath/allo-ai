import { describe, it, expect } from "vitest";
import { toolsRegistry } from "../../src/lib/ai/registry";

describe("AI Tools Registry & Input Validation Schemas", () => {
  it("should contain registered AI tools", () => {
    const toolIds = Object.keys(toolsRegistry);
    expect(toolIds.length).toBe(13);
    expect(toolIds).toContain("resume-analyzer");
    expect(toolIds).toContain("interview-generator");
    expect(toolIds).toContain("proposal");
    expect(toolIds).toContain("meeting-summarizer");
  });

  it("should reject invalid inputs for Resume Analyzer", () => {
    const tool = toolsRegistry["resume-analyzer"];
    const invalidResult = tool.inputSchema.safeParse({ resume: "" });
    expect(invalidResult.success).toBe(false);
  });

  it("should accept valid inputs for Resume Analyzer", () => {
    const tool = toolsRegistry["resume-analyzer"];
    const validResult = tool.inputSchema.safeParse({
      resume: "Experienced Software Engineer skilled in React, Node, and TypeScript.",
      jobDescription: "Senior Frontend Developer position requiring 3+ years experience.",
    });
    expect(validResult.success).toBe(true);
  });
});
