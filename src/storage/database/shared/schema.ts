import { pgTable, serial, varchar, text, timestamp, index, pgPolicy, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    username: varchar({ length: 50 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("users_username_idx").on(table.username),
  ]
);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	summary: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("blog_posts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	pgPolicy("blog_posts_允许公开删除", { as: "permissive", for: "delete", to: ["public"], using: sql`true` }),
	pgPolicy("blog_posts_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("blog_posts_允许公开写入", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("blog_posts_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const gameRecords = pgTable("game_records", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id),
	scenario: text().notNull(),
	finalScore: integer("final_score").default(0).notNull(),
	result: varchar({ length: 50 }).default("未知").notNull(),
	playedAt: timestamp("played_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("game_records_user_id_idx").on(table.userId),
	index("game_records_played_at_idx").using("btree", table.playedAt.desc().nullsLast().op("timestamptz_ops")),
	index("game_records_final_score_idx").on(table.finalScore),
]);
