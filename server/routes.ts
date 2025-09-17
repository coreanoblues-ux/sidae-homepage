import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertVideoSchema, insertNoticeSchema, insertGalleryImageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get('/api/courses', async (req, res) => {
    try {
      const allCourses = await storage.getCourses();
      // Filter courses to only public fields for security
      const courses = allCourses.map(course => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        tags: course.tags,
        order: course.order,
        // Omit sensitive fields like createdAt, updatedAt if they exist
      }));
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const allVideos = await storage.getVideosByCourse(course.id);
      
      // For public access, only show published videos without sensitive URLs
      const videos = allVideos
        .filter(video => video.isPublished)
        .map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          durationSec: video.durationSec,
          isPublished: video.isPublished,
          // externalUrl omitted for security - access via protected endpoints only
        }));
      
      res.json({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        tags: course.tags,
        order: course.order,
        videos
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get('/api/notices', async (req, res) => {
    try {
      const notices = await storage.getActiveNotices();
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.get('/api/gallery', async (req, res) => {
    try {
      const images = await storage.getVisibleGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Protected routes
  app.get('/api/videos/:id/can-view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const canView = await storage.canUserViewVideo(userId, req.params.id);
      res.json({ canView });
    } catch (error) {
      console.error("Error checking video access:", error);
      res.status(500).json({ message: "Failed to check video access" });
    }
  });

  app.post('/api/videos/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const canView = await storage.canUserViewVideo(userId, req.params.id);
      if (!canView) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.recordVideoView(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording video view:", error);
      res.status(500).json({ message: "Failed to record video view" });
    }
  });

  // CRITICAL: Protected video URL endpoint - prevents unauthorized access to video URLs
  app.get('/api/videos/:id/url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const canView = await storage.canUserViewVideo(userId, req.params.id);
      if (!canView) {
        return res.status(403).json({ message: "Access denied to video content" });
      }
      
      const video = await storage.getVideo(req.params.id);
      if (!video || !video.isPublished) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Return the protected video URL only after authorization
      res.json({ url: video.externalUrl, title: video.title });
    } catch (error) {
      console.error("Error getting video URL:", error);
      res.status(500).json({ message: "Failed to get video URL" });
    }
  });

  // Admin routes
  app.get('/api/admin/users/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post('/api/admin/users/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { memo } = req.body;
      await storage.approveUser(req.params.id, req.user.claims.sub, memo);
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/admin/users/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { memo } = req.body;
      await storage.rejectUser(req.params.id, req.user.claims.sub, memo);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.get('/api/admin/courses', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post('/api/admin/courses', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put('/api/admin/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(req.params.id, courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete('/api/admin/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteCourse(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  app.post('/api/admin/videos', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.put('/api/admin/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const videoData = insertVideoSchema.partial().parse(req.body);
      const video = await storage.updateVideo(req.params.id, videoData);
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete('/api/admin/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  app.get('/api/admin/notices', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const notices = await storage.getAllNotices();
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.post('/api/admin/notices', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const noticeData = insertNoticeSchema.parse(req.body);
      const notice = await storage.createNotice(noticeData);
      res.json(notice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notice data", errors: error.errors });
      }
      console.error("Error creating notice:", error);
      res.status(500).json({ message: "Failed to create notice" });
    }
  });

  // Superadmin routes
  app.get('/api/superadmin/pending-users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post('/api/superadmin/approve-user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { userId, memo } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      await storage.approveUser(userId, user.id, memo);
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/superadmin/reject-user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { userId, memo } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      await storage.rejectUser(userId, user.id, memo);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.get('/api/superadmin/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post('/api/superadmin/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const imageData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(imageData);
      res.json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid image data", errors: error.errors });
      }
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.put('/api/superadmin/gallery/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const imageData = insertGalleryImageSchema.partial().parse(req.body);
      const image = await storage.updateGalleryImage(req.params.id, imageData);
      res.json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid image data", errors: error.errors });
      }
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete('/api/superadmin/gallery/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteGalleryImage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  app.post('/api/superadmin/gallery/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const image = await storage.toggleGalleryImageVisibility(req.params.id);
      res.json(image);
    } catch (error) {
      console.error("Error toggling gallery image visibility:", error);
      res.status(500).json({ message: "Failed to toggle gallery image visibility" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
