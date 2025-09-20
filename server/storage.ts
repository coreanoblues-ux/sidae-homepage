import {
  users,
  courses,
  videos,
  videoAccessOverrides,
  videoViews,
  notices,
  approvals,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Video,
  type InsertVideo,
  type VideoAccessOverride,
  type VideoView,
  type Notice,
  type InsertNotice,
  type Approval,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Video operations
  getVideosByCourse(courseId: string): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  
  // Video access operations
  canUserViewVideo(userId: string, videoId: string): Promise<boolean>;
  recordVideoView(userId: string, videoId: string): Promise<void>;
  
  // Notice operations
  getActiveNotices(): Promise<Notice[]>;
  getAllNotices(): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: string, notice: Partial<InsertNotice>): Promise<Notice>;
  deleteNotice(id: string): Promise<void>;
  
  // User approval operations
  getPendingUsers(): Promise<User[]>;
  approveUser(userId: string, adminId: string, memo?: string): Promise<void>;
  rejectUser(userId: string, adminId: string, memo?: string): Promise<void>;
  getUserApprovals(userId: string): Promise<Approval[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(asc(courses.order), asc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.slug, slug));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Video operations
  async getVideosByCourse(courseId: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.courseId, courseId))
      .orderBy(asc(videos.createdAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video> {
    const [updatedVideo] = await db
      .update(videos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Video access operations
  async canUserViewVideo(userId: string, videoId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || (user.role !== 'VERIFIED' && user.role !== 'ADMIN')) {
      return false;
    }

    const video = await this.getVideo(videoId);
    if (!video || !video.isPublished) {
      return false;
    }

    // Check access override
    const [override] = await db
      .select()
      .from(videoAccessOverrides)
      .where(and(eq(videoAccessOverrides.videoId, videoId), eq(videoAccessOverrides.userId, userId)));
    
    if (override) {
      return override.canView;
    }

    // Check time-based access
    const now = new Date();
    if (video.accessStart && now < video.accessStart) {
      return false;
    }
    if (video.accessEnd && now > video.accessEnd) {
      return false;
    }

    return true;
  }

  async recordVideoView(userId: string, videoId: string): Promise<void> {
    await db.insert(videoViews).values({
      userId,
      videoId,
    });
  }

  // Notice operations
  async getActiveNotices(): Promise<Notice[]> {
    const now = new Date();
    return await db
      .select()
      .from(notices)
      .where(
        and(
          or(isNull(notices.startsAt), sql`${notices.startsAt} <= ${now}`),
          or(isNull(notices.endsAt), sql`${notices.endsAt} >= ${now}`)
        )
      )
      .orderBy(desc(notices.createdAt));
  }

  async getAllNotices(): Promise<Notice[]> {
    return await db.select().from(notices).orderBy(desc(notices.createdAt));
  }

  async createNotice(notice: InsertNotice): Promise<Notice> {
    const [newNotice] = await db.insert(notices).values(notice).returning();
    return newNotice;
  }

  async updateNotice(id: string, notice: Partial<InsertNotice>): Promise<Notice> {
    const [updatedNotice] = await db
      .update(notices)
      .set(notice)
      .where(eq(notices.id, id))
      .returning();
    return updatedNotice;
  }

  async deleteNotice(id: string): Promise<void> {
    await db.delete(notices).where(eq(notices.id, id));
  }

  // User approval operations
  async getPendingUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'PENDING'))
      .orderBy(asc(users.createdAt));
  }

  async approveUser(userId: string, adminId: string, memo?: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ role: 'VERIFIED', updatedAt: new Date() })
        .where(eq(users.id, userId));

      await tx.insert(approvals).values({
        userId,
        adminId,
        status: 'APPROVED',
        memo,
      });
    });
  }

  async rejectUser(userId: string, adminId: string, memo?: string): Promise<void> {
    await db.insert(approvals).values({
      userId,
      adminId,
      status: 'REJECTED',
      memo,
    });
  }

  async getUserApprovals(userId: string): Promise<Approval[]> {
    return await db
      .select()
      .from(approvals)
      .where(eq(approvals.userId, userId))
      .orderBy(desc(approvals.createdAt));
  }
}

export const storage = new DatabaseStorage();
