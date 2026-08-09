export type PlanType = "FREE" | "PRO" | "BUSINESS";

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  monthlyGenerations: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: 0,
    monthlyGenerations: 5,
    description: "Essential AI tools to kickstart your personal productivity.",
    features: [
      "5 AI generations / month",
      "All basic AI tools",
      "Saved history & documents",
      "Favorites & basic exports",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: 299,
    monthlyGenerations: 100,
    description: "For professionals seeking elevated productivity and advanced capabilities.",
    recommended: true,
    features: [
      "100 AI generations / month",
      "All AI tools (Career, Dev, Learning)",
      "Unlimited saved history",
      "Advanced document export",
      "Early access to new tools",
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    price: 799,
    monthlyGenerations: 500,
    description: "Complete AI platform for freelancers, agencies, and growing startups.",
    features: [
      "500 AI generations / month",
      "All AI tools + Business Suite",
      "Freelancer CRM & Proposals",
      "Invoice Generator & Social Planner",
      "Advanced exports & priority support",
    ],
  },
};

export function getPlanConfig(planType?: string): PlanConfig {
  const normalized = (planType || "FREE").toUpperCase() as PlanType;
  return PLANS[normalized] || PLANS.FREE;
}
