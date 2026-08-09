import { PlanType, getPlanConfig } from "./plans";
import { toolsRegistry } from "@/lib/ai/registry";

export interface UserPlanData {
  plan?: PlanType;
  subscriptionStatus?: string;
}

export function canUseTool(userPlanData: UserPlanData | undefined, toolId: string): boolean {
  const plan = userPlanData?.plan || "FREE";
  const tool = toolsRegistry[toolId];

  if (!tool) return true; // Default allow if unknown tool

  // Check tool planRequirement ("FREE" | "PRO" | "BUSINESS")
  const planHierarchy: Record<PlanType, number> = {
    FREE: 1,
    PRO: 2,
    BUSINESS: 3,
  };

  const requiredPlan = (tool.planRequirement || "FREE").toUpperCase() as PlanType;
  const userLevel = planHierarchy[plan] || 1;
  const requiredLevel = planHierarchy[requiredPlan] || 1;

  return userLevel >= requiredLevel;
}

export type FeatureKey = 
  | "basic-tools"
  | "advanced-tools"
  | "business-tools"
  | "unlimited-history"
  | "advanced-export"
  | "crm"
  | "proposals";

export function canAccessFeature(userPlanData: UserPlanData | undefined, featureKey: FeatureKey): boolean {
  const plan = userPlanData?.plan || "FREE";

  switch (featureKey) {
    case "basic-tools":
      return true;
    case "advanced-tools":
    case "unlimited-history":
    case "advanced-export":
      return plan === "PRO" || plan === "BUSINESS";
    case "business-tools":
    case "crm":
    case "proposals":
      return plan === "BUSINESS" || plan === "PRO"; // Accessible to Pro/Business
    default:
      return true;
  }
}
