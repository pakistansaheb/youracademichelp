"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userSettings, userSubjects, users } from "@/db/schema";

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const subjectIds = formData.getAll("subjects").map(String);
  const trackApprenticeships = formData.get("trackApprenticeships") === "on";

  if (subjectIds.length === 0) {
    redirect("/onboarding?error=pick-a-subject");
  }

  await db
    .insert(userSubjects)
    .values(subjectIds.map((subjectId) => ({ userId, subjectId })))
    .onConflictDoNothing();

  await db
    .insert(userSettings)
    .values({ userId, trackApprenticeships })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { trackApprenticeships },
    });

  await db
    .update(users)
    .set({ onboardingComplete: true })
    .where(eq(users.id, userId));

  redirect("/dashboard");
}
