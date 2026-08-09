export type ErrorCategory =
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND_ERROR"
  | "RATE_LIMIT_ERROR"
  | "USAGE_LIMIT_ERROR"
  | "AI_ERROR"
  | "DATABASE_ERROR"
  | "BILLING_ERROR"
  | "PAYMENT_ERROR"
  | "NETWORK_ERROR"
  | "CONFIGURATION_ERROR"
  | "UNKNOWN_ERROR";

export interface AlloErrorDetail {
  category: ErrorCategory;
  code: string;
  userMessage: string;
  requestId: string;
  status: number;
}

export function generateRequestId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALLO-${random}`;
}

export function mapToUserFriendlyError(
  rawError: any,
  overrideCategory?: ErrorCategory
): AlloErrorDetail {
  const requestId = generateRequestId();
  const rawCode = rawError?.code || rawError?.error?.code || "";
  const rawMsg = rawError?.message || rawError?.error?.message || String(rawError || "");

  // 1. Rate Limit
  if (rawCode === "RATE_LIMITED" || rawMsg.includes("rate limit") || rawMsg.includes("429")) {
    return {
      category: "RATE_LIMIT_ERROR",
      code: "RATE_LIMITED",
      userMessage: "You're making requests too quickly. Please wait a moment before trying again.",
      requestId,
      status: 429,
    };
  }

  // 2. Usage Limit
  if (rawCode === "USAGE_LIMIT_REACHED" || rawMsg.includes("usage limit")) {
    return {
      category: "USAGE_LIMIT_ERROR",
      code: "USAGE_LIMIT_REACHED",
      userMessage: "You've reached your monthly AI generation limit. Upgrade your plan to continue.",
      requestId,
      status: 403,
    };
  }

  // 3. Authentication
  if (rawCode === "UNAUTHORIZED" || rawMsg.includes("401") || rawMsg.includes("auth")) {
    return {
      category: "AUTHENTICATION_ERROR",
      code: "UNAUTHORIZED",
      userMessage: "Your session has expired. Please sign in again.",
      requestId,
      status: 401,
    };
  }

  // 4. Authorization
  if (rawCode === "FORBIDDEN" || rawMsg.includes("403") || rawMsg.includes("PERMISSION_DENIED")) {
    return {
      category: "AUTHORIZATION_ERROR",
      code: "FORBIDDEN",
      userMessage: "You don't have permission to access this item.",
      requestId,
      status: 403,
    };
  }

  // 5. AI Error
  if (rawCode.includes("AI_") || rawMsg.includes("Gemini") || rawMsg.includes("AI generation")) {
    return {
      category: "AI_ERROR",
      code: "AI_GENERATION_FAILED",
      userMessage: "ALLO couldn't generate your result right now. Please check your inputs and try again.",
      requestId,
      status: 500,
    };
  }

  // 6. Network / Offline
  if (rawMsg.includes("Failed to fetch") || rawMsg.includes("NetworkError") || rawMsg.includes("offline")) {
    return {
      category: "NETWORK_ERROR",
      code: "NETWORK_ERROR",
      userMessage: "You're offline or your connection was interrupted. Please check your network.",
      requestId,
      status: 503,
    };
  }

  // Fallback
  return {
    category: overrideCategory || "UNKNOWN_ERROR",
    code: rawCode || "INTERNAL_ERROR",
    userMessage: "Something went wrong on our side. Please try again.",
    requestId,
    status: 500,
  };
}
