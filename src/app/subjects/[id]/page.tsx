import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subjects, topics } from "@/db/schema";
import { Card } from "@/components/ui/card";

export default async function SubjectPage({
  params,
}: PageProps<"/subjects/[id]">) {
  const { id } = await params;

  const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
  if (!subject) notFound();

  const subjectTopics = await db
    .select()
    .from(topics)
    .where(eq(topics.subjectId, id))
    .orderBy(topics.orderIndex);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← All subjects
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: subject.colorTag }}
        />
        <div>
          <h1 className="text-xl font-semibold text-foreground">{subject.name}</h1>
          {subject.examBoard && (
            <p className="text-sm text-muted">
              {subject.examBoard}
              {subject.specCode ? ` · ${subject.specCode}` : ""}
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        {subjectTopics.length} topic{subjectTopics.length === 1 ? "" : "s"}
      </p>

      <Card className="mt-2 divide-y divide-border">
        {subjectTopics.map((topic) => (
          <div key={topic.id} className="px-4 py-3 text-sm text-foreground">
            {topic.title}
          </div>
        ))}
      </Card>
    </main>
  );
}
