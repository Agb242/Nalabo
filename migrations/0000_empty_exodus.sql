CREATE TABLE "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"description" text,
	"issuer" text DEFAULT 'Nalabo' NOT NULL,
	"issued_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"badge_url" text,
	"verification_code" text,
	CONSTRAINT "certifications_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "challenge_participations" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer,
	"user_id" integer,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"score" integer DEFAULT 0,
	"submitted_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"creator_id" integer,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"points" integer NOT NULL,
	"deadline" timestamp,
	"is_active" boolean DEFAULT true,
	"rules" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" integer,
	"is_private" boolean DEFAULT false,
	"settings" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer,
	"user_id" integer,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'user' NOT NULL,
	"avatar" text,
	"points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workshop_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workshop_id" integer,
	"user_id" integer,
	"status" text DEFAULT 'started' NOT NULL,
	"progress" json,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"time_spent" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"creator_id" integer,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"template" text,
	"steps" json,
	"environment_config" json,
	"tags" text[],
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_sessions" ADD CONSTRAINT "workshop_sessions_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_sessions" ADD CONSTRAINT "workshop_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;