import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "./actions";

export default async function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.onboardingComplete) redirect("/dashboard");

  const { error } = await searchParams;
  const subjects = await db.query.subjects.findMany({
    orderBy: (s, { asc }) => asc(s.name),
  });

  return (
    <main className="flex min-h-screen flex-1 justify-center bg-accent-soft/40 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Let&apos;s set up your dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Pick the subjects you&apos;re studying. You can add or remove
            topics later, and change any of this anytime.
          </p>
        </div>

        <form action={completeOnboarding}>
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Which subjects are you studying?
            </h2>
            {error === "pick-a-subject" && (
              <p className="mb-4 rounded-lg bg-confidence-red-soft px-3 py-2 text-sm text-confidence-red">
                Pick at least one subject to continue.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {subjects.map((subject) => (
                <label key={subject.id} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="subjects"
                    value={subject.id}
                    className="peer sr-only"
                  />
                  <div
                    className="rounded-xl border-2 border-border p-4 transition-colors peer-checked:border-accent peer-checked:bg-accent-soft"
                    style={{ borderLeftColor: subject.colorTag, borderLeftWidth: 4 }}
                  >
                    <p className="font-medium text-foreground">{subject.name}</p>
                    {subject.examBoard && (
                      <p className="mt-0.5 text-xs text-muted">
                        {subject.examBoard}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="mt-4 p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="trackApprenticeships"
                className="mt-1 h-4 w-4 rounded accent-[#265bf6]"
              />
              <span>
                <span className="block font-medium text-foreground">
                  Also track apprenticeships?
                </span>
                <span className="block text-sm text-muted">
                  See live apprenticeship listings, mark ones you&apos;re
                  interested in, and get help drafting applications. You can
                  turn this on later too.
                </span>
              </span>
            </label>
          </Card>

          <Button type="submit" className="mt-6 w-full">
            Continue to my dashboard
          </Button>
        </form>
      </div>
    </main>
  );
}
