import { describe, it, expect } from "vitest";
import { getPlanConfig, PLANS } from "@/lib/billing/plans";

describe("Pricing Plans & Quotas Configuration", () => {
  it("should return FREE plan by default when unspecified or invalid", () => {
    expect(getPlanConfig()).toEqual(PLANS.FREE);
    expect(getPlanConfig("INVALID_PLAN")).toEqual(PLANS.FREE);
  });

  it("should return accurate prices and monthly quotas for all plan tiers", () => {
    const free = getPlanConfig("FREE");
    expect(free.price).toBe(0);
    expect(free.monthlyGenerations).toBe(5);

    const pro = getPlanConfig("PRO");
    expect(pro.price).toBe(299);
    expect(pro.monthlyGenerations).toBe(100);

    const business = getPlanConfig("BUSINESS");
    expect(business.price).toBe(799);
    expect(business.monthlyGenerations).toBe(500);
  });
});
