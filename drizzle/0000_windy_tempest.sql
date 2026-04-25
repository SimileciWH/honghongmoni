CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "game_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scenario" text NOT NULL,
	"final_score" integer DEFAULT 0 NOT NULL,
	"result" varchar(50) DEFAULT '未知' NOT NULL,
	"played_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_check" (
	"id" serial NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "game_records" ADD CONSTRAINT "game_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "game_records_user_id_idx" ON "game_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_records_played_at_idx" ON "game_records" USING btree ("played_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "game_records_final_score_idx" ON "game_records" USING btree ("final_score");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE POLICY "blog_posts_允许公开删除" ON "blog_posts" AS PERMISSIVE FOR DELETE TO public USING (true);--> statement-breakpoint
CREATE POLICY "blog_posts_允许公开更新" ON "blog_posts" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "blog_posts_允许公开写入" ON "blog_posts" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "blog_posts_允许公开读取" ON "blog_posts" AS PERMISSIVE FOR SELECT TO public;