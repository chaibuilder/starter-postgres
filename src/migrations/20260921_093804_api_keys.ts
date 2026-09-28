import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ai_page_edits" (
  	"pageId" uuid PRIMARY KEY NOT NULL,
  	"app" uuid NOT NULL,
  	"userId" text NOT NULL,
  	"tokenId" uuid,
  	"tokenLabel" text DEFAULT '' NOT NULL,
  	"lastTool" text DEFAULT '' NOT NULL,
  	"startedAt" timestamp with time zone DEFAULT now() NOT NULL,
  	"lastActivityAt" timestamp with time zone DEFAULT now() NOT NULL,
  	"expiresAt" timestamp with time zone NOT NULL
  );
  
  ALTER TABLE "app_pages_online" ADD COLUMN "source" text;
  ALTER TABLE "app_pages_revisions" ADD COLUMN "source" text;
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "ai_page_edits" ADD CONSTRAINT "ai_page_edits_page_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."app_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_page_edits" ADD CONSTRAINT "ai_page_edits_app_fkey" FOREIGN KEY ("app") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ai_page_edits_app_idx" ON "ai_page_edits" USING btree ("app" uuid_ops);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ai_page_edits" CASCADE;
  ALTER TABLE "app_pages_online" DROP COLUMN "source";
  ALTER TABLE "app_pages_revisions" DROP COLUMN "source";
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";`)
}
