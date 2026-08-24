CREATE TYPE "public"."confidence" AS ENUM('not_confident', 'getting_there', 'confident');--> statement-breakpoint
CREATE TYPE "public"."deadline_source" AS ENUM('manual', 'email_confirmed');--> statement-breakpoint
CREATE TYPE "public"."draft_status" AS ENUM('draft', 'submitted', 'interview', 'offer', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."email_category" AS ENUM('topic_suggestion', 'deadline', 'interview_link');--> statement-breakpoint
CREATE TYPE "public"."email_provider" AS ENUM('outlook', 'gmail');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('interested', 'not_interested');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'user');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'confirmed', 'dismissed');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "application_draft" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"content" text NOT NULL,
	"status" "draft_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_link_suggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"application_draft_id" text NOT NULL,
	"linked_email_id" text NOT NULL,
	"suggested_status" "draft_status" NOT NULL,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apprenticeship_listing" (
	"id" text PRIMARY KEY NOT NULL,
	"external_ref" text NOT NULL,
	"title" text NOT NULL,
	"employer" text NOT NULL,
	"location" text,
	"level" integer,
	"wage" text,
	"closing_date" timestamp,
	"description" text,
	"apply_url" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apprenticeship_listing_external_ref_unique" UNIQUE("external_ref")
);
--> statement-breakpoint
CREATE TABLE "apprenticeship_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"education" text,
	"experience" text,
	"skills" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deadline_suggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject_id" text,
	"linked_email_id" text NOT NULL,
	"suggested_title" text NOT NULL,
	"suggested_due_date" timestamp,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deadline" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject_id" text,
	"title" text NOT NULL,
	"due_date" timestamp NOT NULL,
	"source" "deadline_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "email_provider" NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text,
	"expires_at" timestamp,
	"connected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linked_email" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"external_message_id" text NOT NULL,
	"provider" "email_provider" NOT NULL,
	"sender" text NOT NULL,
	"subject_line" text,
	"body" text,
	"category" "email_category" NOT NULL,
	"received_at" timestamp,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_link_attempt" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "magic_link_attempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_exam_date" (
	"user_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"exam_date" timestamp,
	CONSTRAINT "subject_exam_date_user_id_subject_id_pk" PRIMARY KEY("user_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"exam_board" text,
	"spec_code" text,
	"color_tag" text DEFAULT '#265BF6' NOT NULL,
	"is_seeded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subject_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_suggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"linked_email_id" text NOT NULL,
	"status" "suggestion_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"title" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_listing_status" (
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"status" "listing_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_listing_status_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"track_apprenticeships" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subject" (
	"user_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subject_user_id_subject_id_pk" PRIMARY KEY("user_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "user_topic_progress" (
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"confidence" "confidence",
	"note" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_topic_progress_user_id_topic_id_pk" PRIMARY KEY("user_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_draft" ADD CONSTRAINT "application_draft_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_draft" ADD CONSTRAINT "application_draft_listing_id_apprenticeship_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."apprenticeship_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_link_suggestion" ADD CONSTRAINT "application_link_suggestion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_link_suggestion" ADD CONSTRAINT "application_link_suggestion_application_draft_id_application_draft_id_fk" FOREIGN KEY ("application_draft_id") REFERENCES "public"."application_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_link_suggestion" ADD CONSTRAINT "application_link_suggestion_linked_email_id_linked_email_id_fk" FOREIGN KEY ("linked_email_id") REFERENCES "public"."linked_email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apprenticeship_profile" ADD CONSTRAINT "apprenticeship_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadline_suggestion" ADD CONSTRAINT "deadline_suggestion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadline_suggestion" ADD CONSTRAINT "deadline_suggestion_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadline_suggestion" ADD CONSTRAINT "deadline_suggestion_linked_email_id_linked_email_id_fk" FOREIGN KEY ("linked_email_id") REFERENCES "public"."linked_email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadline" ADD CONSTRAINT "deadline_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadline" ADD CONSTRAINT "deadline_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_connection" ADD CONSTRAINT "email_connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linked_email" ADD CONSTRAINT "linked_email_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linked_email" ADD CONSTRAINT "linked_email_connection_id_email_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."email_connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_session" ADD CONSTRAINT "study_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_session" ADD CONSTRAINT "study_session_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_session" ADD CONSTRAINT "study_session_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_exam_date" ADD CONSTRAINT "subject_exam_date_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_exam_date" ADD CONSTRAINT "subject_exam_date_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_suggestion" ADD CONSTRAINT "topic_suggestion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_suggestion" ADD CONSTRAINT "topic_suggestion_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_suggestion" ADD CONSTRAINT "topic_suggestion_linked_email_id_linked_email_id_fk" FOREIGN KEY ("linked_email_id") REFERENCES "public"."linked_email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_listing_status" ADD CONSTRAINT "user_listing_status_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_listing_status" ADD CONSTRAINT "user_listing_status_listing_id_apprenticeship_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."apprenticeship_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subject" ADD CONSTRAINT "user_subject_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subject" ADD CONSTRAINT "user_subject_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;