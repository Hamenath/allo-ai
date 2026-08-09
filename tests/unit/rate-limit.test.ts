import { describe, it, expect } from "vitest";
import { checkRateLimit, acquireConcurrencyLock, RATE_LIMIT_CONFIG } from "../../src/lib/security/rate-limit";

describe("Infrastructure Rate Limiting & Concurrency Engine", () => {
  it("should have correct rate limit configurations defined", () => {
    expect(RATE_LIMIT_CONFIG.aiMinute.limit).toBe(10);
    expect(RATE_LIMIT_CONFIG.billing.limit).toBe(5);
    expect(RATE_LIMIT_CONFIG.admin.limit).toBe(60);
  });

  it("should allow initial request under limit", async () => {
    const testKey = `test_limit_${Date.now()}`;
    const result = await checkRateLimit(testKey, { limit: 5, windowMs: 60000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should enforce limits when requests flood within the window", async () => {
    const testKey = `test_flood_${Date.now()}`;
    const config = { limit: 2, windowMs: 60000 };

    await checkRateLimit(testKey, config); // 1st
    await checkRateLimit(testKey, config); // 2nd
    const blocked = await checkRateLimit(testKey, config); // 3rd (blocked)

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("should enforce max 2 concurrent AI active locks per user", async () => {
    const userId = `test_user_concurrency_${Date.now()}`;
    
    const lock1 = await acquireConcurrencyLock(userId);
    const lock2 = await acquireConcurrencyLock(userId);
    const lock3 = await acquireConcurrencyLock(userId);

    expect(lock1.acquired).toBe(true);
    expect(lock2.acquired).toBe(true);
    expect(lock3.acquired).toBe(false); // 3rd concurrent attempt denied

    lock1.release();
    lock2.release();
    lock3.release();
  });
});
