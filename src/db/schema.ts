import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "@auth/core/adapters";

// --- enums ---

export const roleEnum = pgEnum("role", ["owner", "user"]);
export const confidenceEnum = pgEnum("confidence", [
  "not_confident",
  "getting_there",
  "confident",
]);
export const listingStatusEnum = pgEnum("listing_status", [
  "interested",
  "not_interested",
]);
export const draftStatusEnum = pgEnum("draft_status", [
  "draft",
  "submitted",
  "interview",
  "offer",
  "rejected",
]);
export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "pending",
  "confirmed",
  "dismissed",
]);
export const emailProviderEnum = pgEnum("email_provider", ["outlook", "gmail"]);
export const emailCategoryEnum = pgEnum("email_category", [
  "topic_suggestion",
  "deadline",
  "interview_link",
]);
export const deadlineSourceEnum = pgEnum("deadline_source", [
  "manual",
  "email_confirmed",
]);

// --- Auth.js required tables (shape must match @auth/drizzle-adapter's pg schema) ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: roleEnum("role").notNull().default("user"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// --- magic link rate limiting ---

export const magicLinkAttempts = pgTable("magic_link_attempt", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
});

// --- curriculum tracker ---

export const subjects = pgTable("subject", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  examBoard: text("exam_board"),
  specCode: text("spec_code"),
  colorTag: text("color_tag").notNull().default("#265BF6"),
  isSeeded: boolean("is_seeded").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const topics = pgTable("topic", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  isCustom: boolean("is_custom").notNull().default(false),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSubjects = pgTable(
  "user_subject",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.subjectId] })]
);

export const userTopicProgress = pgTable(
  "user_topic_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    done: boolean("done").notNull().default(false),
    confidence: confidenceEnum("confidence"),
    note: text("note"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.topicId] })]
);

export const subjectExamDates = pgTable(
  "subject_exam_date",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    examDate: timestamp("exam_date", { mode: "date" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.subjectId] })]
);

export const studySessions = pgTable("study_session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  scheduledDate: timestamp("scheduled_date", { mode: "date" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- user settings ---

export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  trackApprenticeships: boolean("track_apprenticeships").notNull().default(false),
});

// --- apprenticeship tracker ---

export const apprenticeshipListings = pgTable("apprenticeship_listing", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  externalRef: text("external_ref").notNull().unique(),
  title: text("title").notNull(),
  employer: text("employer").notNull(),
  location: text("location"),
  level: integer("level"),
  wage: text("wage"),
  closingDate: timestamp("closing_date", { mode: "date" }),
  description: text("description"),
  applyUrl: text("apply_url"),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const userListingStatus = pgTable(
  "user_listing_status",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => apprenticeshipListings.id, { onDelete: "cascade" }),
    status: listingStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listingId] })]
);

export const apprenticeshipProfiles = pgTable("apprenticeship_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  education: text("education"),
  experience: text("experience"),
  skills: text("skills"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const applicationDrafts = pgTable("application_draft", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  listingId: text("listing_id")
    .notNull()
    .references(() => apprenticeshipListings.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  status: draftStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- email integration ---

export const emailConnections = pgTable("email_connection", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: emailProviderEnum("provider").notNull(),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  expiresAt: timestamp("expires_at"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
});

export const linkedEmails = pgTable("linked_email", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  connectionId: text("connection_id")
    .notNull()
    .references(() => emailConnections.id, { onDelete: "cascade" }),
  externalMessageId: text("external_message_id").notNull(),
  provider: emailProviderEnum("provider").notNull(),
  sender: text("sender").notNull(),
  subjectLine: text("subject_line"),
  body: text("body"),
  category: emailCategoryEnum("category").notNull(),
  receivedAt: timestamp("received_at"),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const topicSuggestions = pgTable("topic_suggestion", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  linkedEmailId: text("linked_email_id")
    .notNull()
    .references(() => linkedEmails.id, { onDelete: "cascade" }),
  status: suggestionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deadlineSuggestions = pgTable("deadline_suggestion", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  linkedEmailId: text("linked_email_id")
    .notNull()
    .references(() => linkedEmails.id, { onDelete: "cascade" }),
  suggestedTitle: text("suggested_title").notNull(),
  suggestedDueDate: timestamp("suggested_due_date", { mode: "date" }),
  status: suggestionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deadlines = pgTable("deadline", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  source: deadlineSourceEnum("source").notNull().default("manual"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const applicationLinkSuggestions = pgTable("application_link_suggestion", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationDraftId: text("application_draft_id")
    .notNull()
    .references(() => applicationDrafts.id, { onDelete: "cascade" }),
  linkedEmailId: text("linked_email_id")
    .notNull()
    .references(() => linkedEmails.id, { onDelete: "cascade" }),
  suggestedStatus: draftStatusEnum("suggested_status").notNull(),
  status: suggestionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- relations (for convenient query API usage) ---

export const usersRelations = relations(users, ({ many, one }) => ({
  userSubjects: many(userSubjects),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one }) => ({
  subject: one(subjects, {
    fields: [topics.subjectId],
    references: [subjects.id],
  }),
}));
