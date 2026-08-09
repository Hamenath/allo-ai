import { describe, it, expect } from "vitest";
import { mapToUserFriendlyError, generateRequestId } from "@/lib/errors";

describe("Error Classification & Correlation System", () => {
  it("should generate valid request correlation IDs starting with ALLO-", () => {
    const id = generateRequestId();
    expect(id).toMatch(/^ALLO-[A-Z0-9]{6}$/);
  });

  it("should map 429 rate limit errors to user-friendly messages", () => {
    const err = mapToUserFriendlyError({ code: "RATE_LIMITED", message: "Too Many Requests" });
    expect(err.category).toBe("RATE_LIMIT_ERROR");
    expect(err.status).toBe(429);
    expect(err.userMessage).toContain("making requests too quickly");
  });

  it("should map monthly usage limit errors correctly", () => {
    const err = mapToUserFriendlyError({ code: "USAGE_LIMIT_REACHED", message: "Monthly quota exceeded" });
    expect(err.category).toBe("USAGE_LIMIT_ERROR");
    expect(err.status).toBe(403);
    expect(err.userMessage).toContain("monthly AI generation limit");
  });

  it("should map 401 unauthorized errors without leaking credentials", () => {
    const err = mapToUserFriendlyError({ code: "UNAUTHORIZED", message: "Invalid Bearer token secret_key_123" });
    expect(err.category).toBe("AUTHENTICATION_ERROR");
    expect(err.status).toBe(401);
    expect(err.userMessage).toBe("Your session has expired. Please sign in again.");
    expect(err.userMessage).not.toContain("secret_key_123");
  });
});
