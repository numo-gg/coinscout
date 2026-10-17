import type { NetlifyEvent } from "./http";
import { clientIp } from "./http";

type Bucket = {
  resetAt: number;
  used: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Per-instance guard for paid upstream calls. Netlify may run more than one
 * function instance, so production should also use the platform rate-limit rule
 * documented in the runbook. This still prevents bursts inside every warm
 * instance without storing user data.
 */
export function checkRateLimit(
  event: NetlifyEvent,
  scope: "analysis" | "research" | "draft",
): { allowed: boolean; retryAfterSeconds: number } {
  const limit = scope === "analysis" ? 3 : scope === "research" ? 2 : 6;
  const windowMs = 3 * 60 * 1000;
  const now = Date.now();
  const key = `${scope}:${clientIp(event)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { used: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.used >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  existing.used += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
