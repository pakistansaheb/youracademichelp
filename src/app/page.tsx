import Link from "next/link";
import { db } from "@/db";
import { Card } from "@/components/ui/card";

export default async function Home() {
  const allSubjects = await db.query.subjects.findMany({
    orderBy: (s, { asc }) => asc(s.name),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-xl font-semibold text-foreground">All subjects</h1>
      <p className="mt-1 text-sm text-muted">
        Pick a subject to see its full topic list.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allSubjects.map((subject) => (
          <Link key={subject.id} href={`/subjects/${subject.id}`}>
            <Card
              className="h-full p-5 transition-shadow hover:shadow-md"
              style={{ borderLeftColor: subject.colorTag, borderLeftWidth: 4 }}
            >
              <p className="font-medium text-foreground">{subject.name}</p>
              {subject.examBoard && (
                <p className="mt-0.5 text-xs text-muted">{subject.examBoard}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
