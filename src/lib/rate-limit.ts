import { and, gt, eq, count } from "drizzle-orm";
import { db } from "@/db";
import { magicLinkAttempts } from "@/db/schema";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS_PER_WINDOW = 3;

export async function isRateLimited(email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const [{ value }] = await db
    .select({ value: count() })
    .from(magicLinkAttempts)
    .where(
      and(
        eq(magicLinkAttempts.email, email.toLowerCase()),
        gt(magicLinkAttempts.requestedAt, windowStart)
      )
    );

  return value >= MAX_ATTEMPTS_PER_WINDOW;
}

export async function recordAttempt(email: string): Promise<void> {
  await db.insert(magicLinkAttempts).values({ email: email.toLowerCase() });
}
