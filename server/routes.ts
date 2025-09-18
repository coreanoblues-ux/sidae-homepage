import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertVideoSchema, insertNoticeSchema, insertGalleryImageSchema, insertProgramSchema } from "@shared/schema";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { hashPassword, verifyPassword, signupSchema, loginSchema } from "./auth-utils";
import adminRouter from "./routes/admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // 🎯 쿠키 도메인 동적 설정 헬퍼
  const getCookieOptions = (req: any) => {
    const host = req.get('Host') || '';
    let domain: string | undefined;
    
    if (host.includes('replit.app')) {
      domain = '.replit.app';
    } else if (host.includes('sidae-edu.com')) {
      domain = '.sidae-edu.com';
    } else {
      domain = undefined; // localhost 등
    }
    
    const baseOptions = {
      httpOnly: true,
      secure: host.includes('replit.app') || host.includes('sidae-edu.com'), // HTTPS 전용
      sameSite: 'none' as const,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7일
    };
    
    return domain ? { ...baseOptions, domain } : baseOptions;
  };

  // Superadmin 권한 체크 헬퍼 함수  
  const checkSuperAdminAuth = async (req: any, res: any) => {
    // sid 쿠키가 있으면 바로 통과
    if (req.cookies?.sid === 'admin-token') {
      return true;
    }
    
    // 일반적인 ADMIN 역할 체크
    try {
      const user = await storage.getUser(req.user.claims.sub);
      return user?.role === 'ADMIN';
    } catch (error) {
      return false;
    }
  };

  // Enhanced auth middleware for both OAuth and local users (엄격한 인증)
  const enhancedAuth = async (req: any, res: any, next: any) => {
    // 캐시 금지 헤더 설정
    res.set('Cache-Control', 'no-store');
    
    // 1. Check for local user session first
    const localUserId = (req.session as any)?.localUserId;
    if (localUserId) {
      req.localUser = await storage.getUser(localUserId);
      if (req.localUser) {
        return next();
      }
    }
    
    // 2. sid 쿠키 확인 (개발용 관리자) - 바로 통과
    if (req.cookies?.sid === 'admin-token') {
      // 관리자 사용자 객체 설정
      req.user = {
        claims: { 
          sub: 'dev-admin',
          email: 'admin@sidaeyeongjae.kr',
          first_name: '관리자',
          last_name: '개발용'
        }
      };
      return next();
    }
    
    // 3. OAuth 인증 확인
    if (req.isAuthenticated() && req.user && req.user.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now <= req.user.expires_at) {
        return next();
      }
    }
    
    // 인증 실패 시 무조건 401 (HTML 리다이렉트 금지)
    return res.status(401).json({ ok: false, code: 'UNAUTHENTICATED', message: 'Unauthorized' });
  };

  // Auth routes  
  app.get('/api/auth/user', enhancedAuth, async (req: any, res) => {
    try {
      // 진단 로그 - req.cookies.sid 유무 확인
      console.log('[ME][has sid]', Boolean(req.cookies?.['connect.sid'] || req.cookies?.sid));
      
      let user;
      
      // If it's a local user session
      if (req.localUser) {
        user = req.localUser;
      } else {
        // OAuth user
        const userId = req.user.claims.sub;
        user = await storage.getUser(userId);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다" });
      }
      
      // 환경변수 기반 통일된 쿠키 옵션 (로그인시와 완전히 동일)
      const cookieDomain = process.env.COOKIE_DOMAIN || 'sidae-edu.com';
      const opts = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        domain: cookieDomain,
        path: '/'
      };
      
      // 일부 브라우저 호환을 위해 두 번 처리
      // 1차: clearCookie
      res.clearCookie('connect.sid', opts);
      res.clearCookie('sid', opts);
      
      // 2차: 즉시 만료 쿠키 설정
      res.cookie('connect.sid', '', { ...opts, maxAge: 0 });
      res.cookie('sid', '', { ...opts, maxAge: 0 });
      
      // 캐시 금지 헤더
      res.set('Cache-Control', 'no-store');
      
      res.json({ ok: true, loggedOut: true, message: "로그아웃되었습니다" });
    });
  });

  // Local registration routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const result = signupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "입력 정보가 올바르지 않습니다", 
          errors: result.error.errors 
        });
      }

      const { email, firstName, lastName, password } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "이미 가입된 이메일 주소입니다" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      
      const newUser = await storage.upsertUser({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        isLocalUser: true,
        role: 'PENDING', // Default role, admin needs to approve
        profileImageUrl: null,
      });

      res.status(201).json({ 
        message: "회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다.",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "이메일과 비밀번호를 확인해주세요", 
          errors: result.error.errors 
        });
      }

      const { email, password } = result.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isLocalUser || !user.password) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다" });
      }

      // Check user status
      if (user.role === 'PENDING') {
        return res.status(403).json({ 
          message: "계정이 아직 승인되지 않았습니다. 관리자 승인을 기다려주세요." 
        });
      }

      // Create session for local user
      (req.session as any).localUserId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "로그인 중 오류가 발생했습니다" });
        }
        
        res.json({ 
          message: "로그인 성공",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다" });
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

  // Public program routes
  app.get('/api/programs', async (req, res) => {
    try {
      const programs = await storage.getActivePrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get('/api/programs/:slug', async (req, res) => {
    try {
      const program = await storage.getProgramBySlug(req.params.slug);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      if (!program.isActive) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      // Sanitize HTML content before sending to client
      const sanitizedProgram = {
        ...program,
        content: sanitizeHtml(program.content, {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'a'],
          allowedAttributes: {
            'a': ['href', 'title']
          },
          allowedSchemes: ['http', 'https', 'mailto']
        }),
        curriculum: program.curriculum ? sanitizeHtml(program.curriculum, {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'a'],
          allowedAttributes: {
            'a': ['href', 'title']
          },
          allowedSchemes: ['http', 'https', 'mailto']
        }) : program.curriculum
      };
      
      res.json(sanitizedProgram);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  // Protected routes
  app.get('/api/videos/:id/can-view', enhancedAuth, async (req: any, res) => {
    try {
      const userId = req.localUser ? req.localUser.id : req.user.claims.sub;
      const canView = await storage.canUserViewVideo(userId, req.params.id);
      res.json({ canView });
    } catch (error) {
      console.error("Error checking video access:", error);
      res.status(500).json({ message: "Failed to check video access" });
    }
  });

  app.post('/api/videos/:id/view', enhancedAuth, async (req: any, res) => {
    try {
      const userId = req.localUser ? req.localUser.id : req.user.claims.sub;
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
  app.get('/api/videos/:id/url', enhancedAuth, async (req: any, res) => {
    try {
      const userId = req.localUser ? req.localUser.id : req.user.claims.sub;
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
      const isAuthorized = await checkSuperAdminAuth(req, res);
      if (!isAuthorized) {
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
      const isAuthorized = await checkSuperAdminAuth(req, res);
      if (!isAuthorized) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { userId, memo } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      // sid 쿠키인 경우 임시 사용자 ID 사용
      const adminId = req.cookies?.sid === 'admin-token' ? 'dev-admin' : (await storage.getUser(req.user.claims.sub))?.id || 'unknown-admin';
      await storage.approveUser(userId, adminId, memo);
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/superadmin/reject-user', isAuthenticated, async (req: any, res) => {
    try {
      const isAuthorized = await checkSuperAdminAuth(req, res);
      if (!isAuthorized) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { userId, memo } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      // sid 쿠키인 경우 임시 사용자 ID 사용
      const adminId = req.cookies?.sid === 'admin-token' ? 'dev-admin' : (await storage.getUser(req.user.claims.sub))?.id || 'unknown-admin';
      await storage.rejectUser(userId, adminId, memo);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.get('/api/superadmin/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const isAuthorized = await checkSuperAdminAuth(req, res);
      if (!isAuthorized) {
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

  // Superadmin program management routes
  app.get('/api/superadmin/programs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.post('/api/superadmin/programs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const programData = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(programData);
      res.json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      console.error("Error creating program:", error);
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  app.get('/api/superadmin/programs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const program = await storage.getProgram(req.params.id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  app.put('/api/superadmin/programs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const programData = insertProgramSchema.partial().parse(req.body);
      const program = await storage.updateProgram(req.params.id, programData);
      res.json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      console.error("Error updating program:", error);
      res.status(500).json({ message: "Failed to update program" });
    }
  });

  app.delete('/api/superadmin/programs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteProgram(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting program:", error);
      res.status(500).json({ message: "Failed to delete program" });
    }
  });

  // 🎯 단순한 관리자 API - dev_admin 쿠키만 체크하는 간단한 시스템
  
  // 단순 권한 체크 미들웨어
  const simpleAdminCheck = (req: any, res: any, next: any) => {
    if (req.cookies?.sid === 'admin-token') {
      return next();
    }
    return res.status(401).json({ message: "관리자 권한이 필요합니다" });
  };

  // 인증 상태 확인용 ping API
  app.get('/api/simple/ping', simpleAdminCheck, async (req: any, res) => {
    res.json({ success: true, message: "인증됨" });
  });

  // 대기 회원 목록
  app.get('/api/simple/pending-users', simpleAdminCheck, async (req: any, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("대기 회원 로드 오류:", error);
      res.status(500).json({ message: "대기 회원을 불러올 수 없습니다" });
    }
  });

  // 회원 승인
  app.post('/api/simple/approve-user', simpleAdminCheck, async (req: any, res) => {
    try {
      const { userId, memo } = req.body;
      await storage.approveUser(userId, 'simple-admin', memo || '관리자 승인');
      res.json({ success: true });
    } catch (error) {
      console.error("회원 승인 오류:", error);
      res.status(500).json({ message: "회원 승인 중 오류가 발생했습니다" });
    }
  });

  // 회원 거부
  app.post('/api/simple/reject-user', simpleAdminCheck, async (req: any, res) => {
    try {
      const { userId, memo } = req.body;
      await storage.rejectUser(userId, 'simple-admin', memo || '관리자 거부');
      res.json({ success: true });
    } catch (error) {
      console.error("회원 거부 오류:", error);
      res.status(500).json({ message: "회원 거부 중 오류가 발생했습니다" });
    }
  });

  // 갤러리 이미지 목록
  app.get('/api/simple/gallery', simpleAdminCheck, async (req: any, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("갤러리 로드 오류:", error);
      res.status(500).json({ message: "갤러리를 불러올 수 없습니다" });
    }
  });

  // 갤러리 이미지 추가
  app.post('/api/simple/gallery', simpleAdminCheck, async (req: any, res) => {
    try {
      const { title, description, imageUrl } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ message: "제목과 이미지 URL은 필수입니다" });
      }
      
      const imageData = {
        url: imageUrl,
        caption: title,
        visible: true
      };
      
      const newImage = await storage.createGalleryImage(imageData);
      res.json(newImage);
    } catch (error) {
      console.error("이미지 추가 오류:", error);
      res.status(500).json({ message: "이미지 추가 중 오류가 발생했습니다" });
    }
  });

  // 동영상 링크 목록 (courses에서 비디오 가져오기)
  app.get('/api/simple/videos', simpleAdminCheck, async (req: any, res) => {
    try {
      const courses = await storage.getCourses();
      const videos = [];
      
      for (const course of courses) {
        const courseVideos = await storage.getVideosByCourse(course.id);
        videos.push(...courseVideos.map((video: any) => ({
          id: video.id,
          title: video.title,
          videoUrl: video.externalUrl,
          description: video.description || ''
        })));
      }
      
      res.json(videos);
    } catch (error) {
      console.error("동영상 로드 오류:", error);
      res.status(500).json({ message: "동영상을 불러올 수 없습니다" });
    }
  });

  // 동영상 링크 추가 (새 코스에 추가)
  app.post('/api/simple/videos', simpleAdminCheck, async (req: any, res) => {
    try {
      const { title, videoUrl, description } = req.body;
      if (!title || !videoUrl) {
        return res.status(400).json({ message: "제목과 동영상 URL은 필수입니다" });
      }
      
      // 관리자용 코스가 없으면 생성 (첫 번째 코스 사용)
      const courses = await storage.getCourses();
      let adminCourse = courses.find(course => course.title === '관리자 동영상');
      
      if (!adminCourse) {
        adminCourse = await storage.createCourse({
          title: '관리자 동영상',
          slug: 'admin-videos',
          description: '관리자가 추가한 동영상들',
          thumbnail: null,
          order: 999
        });
      }
      
      const videoData = {
        title,
        description: description || '',
        externalUrl: videoUrl,
        courseId: adminCourse.id
      };
      
      const newVideo = await storage.createVideo(videoData);
      res.json(newVideo);
    } catch (error) {
      console.error("동영상 추가 오류:", error);
      res.status(500).json({ message: "동영상 추가 중 오류가 발생했습니다" });
    }
  });

  // 🎯 새로운 관리자 API 라우터 마운트
  app.use('/api/admin', adminRouter);

  const httpServer = createServer(app);
  return httpServer;
}
