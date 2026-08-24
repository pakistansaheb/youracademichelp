import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

type SeedSubject = {
  slug: string;
  name: string;
  examBoard: string;
  specCode?: string;
  colorTag: string;
  topics: string[];
};

const seedSubjects: SeedSubject[] = [
  {
    slug: "accounting",
    name: "Accounting",
    examBoard: "AQA A-level",
    specCode: "7127",
    colorTag: "#265BF6",
    topics: [
      "An introduction to the role of the accountant in business",
      "Types of business organisation",
      "The double entry model",
      "Verification of accounting records",
      "Accounting concepts used in the preparation of accounting records",
      "Preparation of financial statements of sole traders",
      "Limited company accounts",
      "Analysis and evaluation of financial information",
      "Budgeting",
      "Marginal costing",
      "Standard costing and variance analysis",
      "Absorption and activity based costing",
      "Capital investment appraisal",
      "Accounting for organisations with incomplete records",
      "Partnership accounts",
      "Accounting for limited companies",
      "Interpretation, analysis and communication of accounting information",
      "The impact of ethical considerations",
    ],
  },
  {
    slug: "economics",
    name: "Economics",
    examBoard: "AQA A-level",
    specCode: "7136",
    colorTag: "#1CA789",
    topics: [
      "Economic methodology and the economic problem",
      "Individual economic decision making",
      "Price determination in a competitive market",
      "Production, costs and revenue",
      "Perfect competition, imperfectly competitive markets and monopoly",
      "The labour market",
      "Distribution of income and wealth: poverty and inequality",
      "Market mechanism, market failure and government intervention",
      "Measurement of macroeconomic performance and objectives",
      "How the macroeconomy works: circular flow, AD/AS analysis",
      "Economic performance",
      "Financial markets and monetary policy",
      "Fiscal policy and supply-side policies",
      "The international economy",
    ],
  },
  {
    slug: "business",
    name: "Business",
    examBoard: "Pearson BTEC (assumed: Extended Certificate)",
    colorTag: "#F6A623",
    topics: [
      "Unit 1: Exploring business",
      "Unit 2: Developing a marketing campaign",
      "Unit 3: Personal and business finance",
    ],
  },
];

async function main() {
  for (const subject of seedSubjects) {
    const [row] = await db
      .insert(schema.subjects)
      .values({
        slug: subject.slug,
        name: subject.name,
        examBoard: subject.examBoard,
        specCode: subject.specCode,
        colorTag: subject.colorTag,
        isSeeded: true,
      })
      .onConflictDoUpdate({
        target: schema.subjects.slug,
        set: {
          name: subject.name,
          examBoard: subject.examBoard,
          specCode: subject.specCode,
          colorTag: subject.colorTag,
        },
      })
      .returning();

    for (const [index, title] of subject.topics.entries()) {
      const existing = await db.query.topics.findFirst({
        where: (t, { eq, and }) =>
          and(eq(t.subjectId, row.id), eq(t.title, title)),
      });
      if (existing) continue;

      await db.insert(schema.topics).values({
        subjectId: row.id,
        title,
        orderIndex: index,
        isCustom: false,
      });
    }

    console.log(`Seeded ${subject.name} (${subject.topics.length} topics)`);
  }
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
