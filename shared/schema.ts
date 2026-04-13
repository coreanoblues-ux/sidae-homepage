import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const roleEnum = pgEnum('role', ['PENDING', 'VERIFIED', 'ADMIN']);
export const approvalStatusEnum = pgEnum('approval_status', ['APPROVED', 'REJECTED']);

// Users table (supports both Replit Auth and local registration)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // For local registration
  isLocalUser: boolean("is_local_user").default(false), // Distinguish local vs Replit users
  role: roleEnum("role").default('PENDING').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const approvals = pgTable("approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  adminId: varchar("admin_id").references(() => users.id),
  status: approvalStatusEnum("status").notNull(),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  thumbnail: varchar("thumbnail"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  externalUrl: varchar("external_url").notNull(),
  durationSec: integer("duration_sec"),
  isPublished: boolean("is_published").default(true),
  accessStart: timestamp("access_start"),
  accessEnd: timestamp("access_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoAccessOverrides = pgTable("video_access_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  canView: boolean("can_view").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoViews = pgTable("video_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const notices = pgTable("notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryImages = pgTable("gallery_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: varchar("url").notNull(),
  caption: text("caption"),
  visible: boolean("visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🎯 새로운 단순 동영상 테이블 (사용자 가이드대로)
export const simpleVideos = pgTable("simple_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  type: varchar("type").notNull().$type<'youtube' | 'nas'>(),
  url: varchar("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 프로그램 정보 테이블 (관리자가 편집 가능한 프로그램 소개 페이지)
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug").unique().notNull(), // URL용 (middle-school, high-school, exam-prep)
  title: varchar("title").notNull(), // 프로그램 제목
  subtitle: text("subtitle"), // 부제목
  description: text("description"), // 간단 설명
  content: text("content").notNull(), // 상세 내용 (HTML/Markdown)
  features: text("features").array().default(sql`ARRAY[]::text[]`), // 주요 특징들
  targetStudents: text("target_students"), // 대상 학생
  curriculum: text("curriculum"), // 커리큘럼 정보
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  approvals: many(approvals, { relationName: "user_approvals" }),
  adminApprovals: many(approvals, { relationName: "admin_approvals" }),
  videoViews: many(videoViews),
  videoAccessOverrides: many(videoAccessOverrides),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  user: one(users, {
    fields: [approvals.userId],
    references: [users.id],
    relationName: "user_approvals",
  }),
  admin: one(users, {
    fields: [approvals.adminId],
    references: [users.id],
    relationName: "admin_approvals",
  }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  course: one(courses, {
    fields: [videos.courseId],
    references: [courses.id],
  }),
  views: many(videoViews),
  accessOverrides: many(videoAccessOverrides),
}));

export const videoAccessOverridesRelations = relations(videoAccessOverrides, ({ one }) => ({
  video: one(videos, {
    fields: [videoAccessOverrides.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoAccessOverrides.userId],
    references: [users.id],
  }),
}));

export const videoViewsRelations = relations(videoViews, ({ one }) => ({
  user: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type VideoAccessOverride = typeof videoAccessOverrides.$inferSelect;
export type VideoView = typeof videoViews.$inferSelect;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Approval = typeof approvals.$inferSelect;

// 🎯 SimpleVideo 스키마와 타입 (사용자 가이드대로)
export const insertSimpleVideoSchema = createInsertSchema(simpleVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type SimpleVideo = typeof simpleVideos.$inferSelect;
export type InsertSimpleVideo = z.infer<typeof insertSimpleVideoSchema>;
