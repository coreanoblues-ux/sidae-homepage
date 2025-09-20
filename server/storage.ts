import {
  users,
  courses,
  videos,
  videoAccessOverrides,
  videoViews,
  notices,
  approvals,
  galleryImages,
  programs,
  simpleVideos,
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
  type GalleryImage,
  type InsertGalleryImage,
  type Program,
  type InsertProgram,
  type SimpleVideo,
  type InsertSimpleVideo,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  approveUser(userId: string, adminId: string | null, memo?: string): Promise<void>;
  rejectUser(userId: string, adminId: string | null, memo?: string): Promise<void>;
  getUserApprovals(userId: string): Promise<Approval[]>;
  
  // Gallery operations
  getGalleryImages(): Promise<GalleryImage[]>;
  getVisibleGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<void>;
  toggleGalleryImageVisibility(id: string): Promise<GalleryImage>;
  
  // 🎯 Simple Video operations (사용자 가이드대로)
  getSimpleVideos(): Promise<SimpleVideo[]>;
  getSimpleVideo(id: string): Promise<SimpleVideo | undefined>;
  createSimpleVideo(video: InsertSimpleVideo): Promise<SimpleVideo>;
  updateSimpleVideo(id: string, video: Partial<InsertSimpleVideo>): Promise<SimpleVideo>;
  deleteSimpleVideo(id: string): Promise<void>;
  
  // Program operations
  getPrograms(): Promise<Program[]>;
  getActivePrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  getProgramBySlug(slug: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program>;
  deleteProgram(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async getVerifiedUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'VERIFIED'))
      .orderBy(asc(users.createdAt));
  }

  async approveUser(userId: string, adminId: string | null, memo?: string): Promise<void> {
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

  async rejectUser(userId: string, adminId: string | null, memo?: string): Promise<void> {
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

  async revokeUserApproval(userId: string, adminId: string | null, memo?: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ role: 'PENDING', updatedAt: new Date() })
        .where(eq(users.id, userId));

      await tx.insert(approvals).values({
        userId,
        adminId,
        status: 'REVOKED',
        memo,
      });
    });
  }

  // Gallery operations
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .orderBy(desc(galleryImages.createdAt));
  }

  async getVisibleGalleryImages(): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.visible, true))
      .orderBy(desc(galleryImages.createdAt));
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db
      .insert(galleryImages)
      .values(image)
      .returning();
    return newImage;
  }

  async updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage> {
    const [updatedImage] = await db
      .update(galleryImages)
      .set(image)
      .where(eq(galleryImages.id, id))
      .returning();
    return updatedImage;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  async toggleGalleryImageVisibility(id: string): Promise<GalleryImage> {
    const [image] = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.id, id));
    
    if (!image) {
      throw new Error("Gallery image not found");
    }

    const [updatedImage] = await db
      .update(galleryImages)
      .set({ visible: !image.visible })
      .where(eq(galleryImages.id, id))
      .returning();
    
    return updatedImage;
  }

  // Program operations
  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs).orderBy(asc(programs.order), asc(programs.createdAt));
  }

  async getActivePrograms(): Promise<Program[]> {
    return await db.select().from(programs).where(eq(programs.isActive, true)).orderBy(asc(programs.order), asc(programs.createdAt));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }

  async getProgramBySlug(slug: string): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.slug, slug));
    return program;
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  }

  async updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program> {
    const [updatedProgram] = await db
      .update(programs)
      .set({ ...program, updatedAt: new Date() })
      .where(eq(programs.id, id))
      .returning();
    return updatedProgram;
  }

  async deleteProgram(id: string): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // 🎯 Simple Video operations 구현 (사용자 가이드대로)
  async getSimpleVideos(): Promise<SimpleVideo[]> {
    return await db
      .select()
      .from(simpleVideos)
      .orderBy(desc(simpleVideos.createdAt));
  }

  async getSimpleVideo(id: string): Promise<SimpleVideo | undefined> {
    const [video] = await db
      .select()
      .from(simpleVideos)
      .where(eq(simpleVideos.id, id));
    return video;
  }

  async createSimpleVideo(video: InsertSimpleVideo): Promise<SimpleVideo> {
    const [newVideo] = await db
      .insert(simpleVideos)
      .values({
        title: video.title,
        type: video.type as 'youtube' | 'nas',
        url: video.url
      })
      .returning();
    return newVideo;
  }

  async updateSimpleVideo(id: string, video: Partial<InsertSimpleVideo>): Promise<SimpleVideo> {
    const updateData: any = { updatedAt: new Date() };
    
    if (video.title) updateData.title = video.title;
    if (video.type) updateData.type = video.type;
    if (video.url) updateData.url = video.url;
    
    const [updatedVideo] = await db
      .update(simpleVideos)
      .set(updateData)
      .where(eq(simpleVideos.id, id))
      .returning();
    return updatedVideo;
  }

  async deleteSimpleVideo(id: string): Promise<void> {
    await db.delete(simpleVideos).where(eq(simpleVideos.id, id));
  }
}

export const storage = new DatabaseStorage();
