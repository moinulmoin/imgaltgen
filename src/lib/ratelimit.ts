import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const dailyCreditsRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, "24 h"),
  prefix: "imgaltgen:daily_credits",
  analytics: true,
});

export async function checkCredits(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Just check if user has credits without consuming
  const credits = await getRemainingCredits(userId);
  
  return {
    hasCredits: credits.remaining > 0,
    limit: credits.limit,
    remaining: credits.remaining,
    reset: credits.reset,
    resetDate: credits.resetDate,
  };
}

export async function consumeCredit(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const identifier = userId;

  const { success, limit, remaining, reset } =
    await dailyCreditsRatelimit.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
    resetDate: new Date(reset),
  };
}

export async function getRemainingCredits(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const identifier = userId;
  
  // Calculate the current 24-hour window (in ms since epoch)
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const currentWindow = Math.floor(now / windowMs);
  
  // Build the exact key that Upstash Ratelimit uses
  // Format: prefix:identifier:window
  const prefix = "imgaltgen:daily_credits";
  const key = `${prefix}:${identifier}:${currentWindow}`;
  
  // Get the current count from Redis
  const count = await redis.get<number>(key);
  
  const used = count || 0;
  const remaining = Math.max(0, 10 - used);
  
  // Calculate when the current window ends
  const windowEnd = (currentWindow + 1) * windowMs;
  
  return {
    used,
    remaining,
    limit: 10,
    resetDate: new Date(windowEnd),
    reset: windowEnd,
  };
}
