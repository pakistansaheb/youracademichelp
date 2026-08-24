import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  subjects,
  topics,
  userSettings,
  userSubjects,
  userTopicProgress,
} from "@/db/schema";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const mySubjects = await db
    .select({ subject: subjects })
    .from(userSubjects)
    .innerJoin(subjects, eq(userSubjects.subjectId, subjects.id))
    .where(eq(userSubjects.userId, userId));

  const topicCounts = await db
    .select({ subjectId: topics.subjectId, total: count() })
    .from(topics)
    .groupBy(topics.subjectId);

  const doneCounts = await db
    .select({ subjectId: topics.subjectId, done: count() })
    .from(userTopicProgress)
    .innerJoin(topics, eq(userTopicProgress.topicId, topics.id))
    .where(
      and(eq(userTopicProgress.userId, userId), eq(userTopicProgress.done, true))
    )
    .groupBy(topics.subjectId);

  const totalBySubject = new Map(topicCounts.map((t) => [t.subjectId, t.total]));
  const doneBySubject = new Map(doneCounts.map((d) => [d.subjectId, d.done]));

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Your subjects</h1>
      <p className="mt-1 text-sm text-muted">
        Pick up where you left off, or dive into a topic.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mySubjects.map(({ subject }) => {
          const total = totalBySubject.get(subject.id) ?? 0;
          const done = doneBySubject.get(subject.id) ?? 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Link key={subject.id} href={`/dashboard/subjects/${subject.id}`}>
              <Card
                className="h-full p-5 transition-shadow hover:shadow-md"
                style={{ borderLeftColor: subject.colorTag, borderLeftWidth: 4 }}
              >
                <p className="font-medium text-foreground">{subject.name}</p>
                {subject.examBoard && (
                  <p className="mt-0.5 text-xs text-muted">{subject.examBoard}</p>
                )}
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-accent-soft">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {done} / {total} topics · {pct}%
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      {settings?.trackApprenticeships && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">
            Apprenticeships
          </h2>
          <Link href="/dashboard/apprenticeships" className="mt-3 block">
            <Card className="p-5 transition-shadow hover:shadow-md">
              <p className="font-medium text-foreground">
                Browse apprenticeship listings
              </p>
              <p className="mt-1 text-sm text-muted">
                Coming soon — mark listings you&apos;re interested in and get
                help drafting applications.
              </p>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
