import { NextResponse } from "next/server";

export const RATE_LIMIT_CONFIG = {
  aiMinute: { limit: 10, windowMs: 60 * 1000 },
  aiHour: { limit: 50, windowMs: 60 * 60 * 1000 },
  aiConcurrent: { limit: 2 },
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  passwordReset: { limit: 5, windowMs: 60 * 60 * 1000 },
  signup: { limit: 10, windowMs: 60 * 60 * 1000 },
  billing: { limit: 5, windowMs: 60 * 1000 },
  admin: { limit: 60, windowMs: 60 * 1000 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // in seconds
}

// In-memory sliding window fallback store
const memoryStore = new Map<string, { count: number; resetAt: number }>();
const activeLocks = new Map<string, number>();

/**
 * Check if Redis distributed store is configured
 */
export function isDistributedStoreConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Check rate limit for a key
 */
export async function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const now = Date.now();
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      // Upstash Redis REST pipeline: INCR key, PEXPIRE key windowMs
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["PEXPIRE", key, options.windowMs],
          ["PTTL", key],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data[0]?.result || 1;
        const ttlMs = data[2]?.result || options.windowMs;

        const allowed = count <= options.limit;
        const remaining = Math.max(0, options.limit - count);
        const retryAfter = Math.ceil(ttlMs / 1000);

        return { allowed, remaining, retryAfter };
      }
    } catch (err) {
      console.error("Upstash Redis rate limit error:", err);
    }
  }

  // Safe In-Memory Fallback
  let record = memoryStore.get(key);
  if (!record || now >= record.resetAt) {
    record = { count: 1, resetAt: now + options.windowMs };
    memoryStore.set(key, record);
  } else {
    record.count += 1;
  }

  const allowed = record.count <= options.limit;
  const remaining = Math.max(0, options.limit - record.count);
  const retryAfter = Math.ceil(Math.max(0, record.resetAt - now) / 1000);

  return { allowed, remaining, retryAfter };
}

/**
 * Helper to generate standardized 429 Too Many Requests response
 */
export function rateLimitedResponse(retryAfter: number, message = "Too many requests. Please try again shortly.") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message,
        retryAfter,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}

/**
 * Concurrency Lock Guard
 */
export async function acquireConcurrencyLock(
  userId: string,
  maxConcurrent = RATE_LIMIT_CONFIG.aiConcurrent.limit
): Promise<{ acquired: boolean; release: () => void }> {
  const currentActive = activeLocks.get(userId) || 0;

  if (currentActive >= maxConcurrent) {
    return {
      acquired: false,
      release: () => {},
    };
  }

  activeLocks.set(userId, currentActive + 1);

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    const active = activeLocks.get(userId) || 1;
    if (active <= 1) {
      activeLocks.delete(userId);
    } else {
      activeLocks.set(userId, active - 1);
    }
  };

  return { acquired: true, release };
}
