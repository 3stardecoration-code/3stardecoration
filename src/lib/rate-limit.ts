import "server-only";
import { getDataService } from "@/lib/services";

// Thresholds — tune these based on real traffic. All windows are minutes.
const IP_BURST_LIMIT = 3;
const IP_BURST_WINDOW_MIN = 15;
const IP_DAILY_LIMIT = 8;
const IP_DAILY_WINDOW_MIN = 24 * 60;
const PHONE_LIMIT = 2;
const PHONE_WINDOW_MIN = 10;

const FRIENDLY_MESSAGE =
  "You've already reached out recently — we'll be in touch soon. If it's urgent, message us directly on WhatsApp.";

export type RateLimitResult = { allowed: true } | { allowed: false; message: string };

/**
 * Public-write rate limiting for the enquiry form, backed by the enquiries
 * table itself — no separate counters/infra needed. Call before validating
 * or inserting a new submission.
 */
export async function checkEnquiryRateLimit(ip: string, phone: string): Promise<RateLimitResult> {
  const enquiries = getDataService().enquiries;

  // Unknown IP (header missing/stripped) — skip IP checks, still enforce the phone check.
  if (ip && ip !== "unknown") {
    const [ipBurst, ipDaily] = await Promise.all([
      enquiries.countByIpSince(ip, IP_BURST_WINDOW_MIN),
      enquiries.countByIpSince(ip, IP_DAILY_WINDOW_MIN),
    ]);
    if (ipBurst >= IP_BURST_LIMIT || ipDaily >= IP_DAILY_LIMIT) {
      return { allowed: false, message: FRIENDLY_MESSAGE };
    }
  }

  const phoneCount = await enquiries.countByPhoneSince(phone, PHONE_WINDOW_MIN);
  if (phoneCount >= PHONE_LIMIT) {
    return { allowed: false, message: FRIENDLY_MESSAGE };
  }

  return { allowed: true };
}

/** First IP in the x-forwarded-for chain is the original client; falls back to x-real-ip. */
export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
