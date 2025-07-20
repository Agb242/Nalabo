CREATE TABLE "infrastructure_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"cluster_id" integer,
	"user_id" integer,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"details" json,
	"ip_address" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kubernetes_infrastructure" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"kubeconfig" text NOT NULL,
	"endpoint" text NOT NULL,
	"region" text,
	"provider" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"resource_limits" json,
	"vcluster_enabled" boolean DEFAULT true,
	"managed_by_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vcluster_instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"workshop_id" integer,
	"user_id" integer,
	"cluster_id" integer,
	"namespace" text NOT NULL,
	"status" text DEFAULT 'creating' NOT NULL,
	"vcluster_config" json,
	"access_config" json,
	"resource_usage" json,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vcluster_instances_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "workshop_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"workshop_id" integer,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"step_index" integer,
	"description" text,
	"is_public" boolean DEFAULT false,
	"uploaded_by_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "subscription" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "k8s_cluster_id" integer;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "permissions" json;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "resource_limits" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "community_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "permissions" json;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "community_id" integer;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "kubernetes_tools" json;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "required_resources" json;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "documents" json;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "vcluster_template" text;--> statement-breakpoint
ALTER TABLE "workshops" ADD COLUMN "isolation_level" text DEFAULT 'standard';--> statement-breakpoint
ALTER TABLE "infrastructure_audit_log" ADD CONSTRAINT "infrastructure_audit_log_cluster_id_kubernetes_infrastructure_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."kubernetes_infrastructure"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "infrastructure_audit_log" ADD CONSTRAINT "infrastructure_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kubernetes_infrastructure" ADD CONSTRAINT "kubernetes_infrastructure_managed_by_id_users_id_fk" FOREIGN KEY ("managed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vcluster_instances" ADD CONSTRAINT "vcluster_instances_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vcluster_instances" ADD CONSTRAINT "vcluster_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vcluster_instances" ADD CONSTRAINT "vcluster_instances_cluster_id_kubernetes_infrastructure_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."kubernetes_infrastructure"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_documents" ADD CONSTRAINT "workshop_documents_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_documents" ADD CONSTRAINT "workshop_documents_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_k8s_cluster_id_kubernetes_infrastructure_id_fk" FOREIGN KEY ("k8s_cluster_id") REFERENCES "public"."kubernetes_infrastructure"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;