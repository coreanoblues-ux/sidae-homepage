import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// 🎯 쿠키 도메인 동적 설정 헬퍼 (수정됨 - localhost 호환성)
const getCookieOptions = (req: any) => {
  const host = req.get('Host') || '';
  
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    // localhost - sameSite: lax, secure: false, domain 없음
    return {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 // 24시간
    };
  } else if (host.includes('replit.app') || host.includes('repl.co') || host.includes('replit.dev')) {
    // Replit - domain과 secure 설정
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      domain: '.replit.app',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24
    };
  } else if (host.includes('sidae-edu.com')) {
    // 커스텀 도메인
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      domain: '.sidae-edu.com',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24
    };
  } else {
    // 기본값 (localhost와 동일)
    return {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24
    };
  }
};

// 🔒 관리자 권한 체크 미들웨어
const adminGuard = (req: any, res: any, next: any) => {
  if (req.cookies?.sid === 'admin-token') {
    return next();
  }
  return res.status(401).json({ ok: false, message: 'Unauthorized' });
};

// ✅ 로그인
router.post('/login', async (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.SUPERADMIN_PASSWORD || '671321';
  
  if (password !== correctPassword) {
    return res.status(401).json({ ok: false, message: '잘못된 비밀번호입니다.' });
  }
  
  // sid 쿠키 설정
  const cookieOptions = getCookieOptions(req);
  res.cookie('sid', 'admin-token', cookieOptions);
  
  res.json({ ok: true, message: '로그인 성공' });
});

// ✅ 로그아웃
router.post('/logout', (req, res) => {
  const cookieOptions = getCookieOptions(req);
  res.clearCookie('sid', cookieOptions);
  res.cookie('sid', '', { ...cookieOptions, maxAge: 0 });
  
  res.json({ ok: true, message: '로그아웃 완료' });
});

// ✅ 대기중인 회원 목록
router.get('/members', adminGuard, async (req, res) => {
  try {
    const { status } = req.query;
    
    if (status === 'pending') {
      const members = await storage.getPendingUsers();
      res.json({ 
        ok: true, 
        items: members.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt
        }))
      });
    } else {
      res.json({ ok: true, items: [] });
    }
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch members' });
  }
});

// ✅ 회원 승인
router.post('/approve-user', adminGuard, async (req, res) => {
  try {
    const { userId, memo } = req.body;
    if (!userId) {
      return res.status(400).json({ ok: false, message: 'User ID is required' });
    }
    
    await storage.approveUser(userId, 'admin', memo || '관리자 승인');
    res.json({ ok: true, message: '회원이 승인되었습니다' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ ok: false, message: 'Failed to approve user' });
  }
});

// ✅ 회원 거부
router.post('/reject-user', adminGuard, async (req, res) => {
  try {
    const { userId, memo } = req.body;
    if (!userId) {
      return res.status(400).json({ ok: false, message: 'User ID is required' });
    }
    
    await storage.rejectUser(userId, 'admin', memo || '관리자 거부');
    res.json({ ok: true, message: '회원이 거부되었습니다' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ ok: false, message: 'Failed to reject user' });
  }
});

// ✅ 갤러리 이미지 목록
router.get('/gallery', adminGuard, async (req, res) => {
  try {
    const images = await storage.getGalleryImages();
    res.json({ ok: true, items: images });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch gallery' });
  }
});

// ✅ 갤러리 이미지 추가
router.post('/gallery', adminGuard, async (req, res) => {
  try {
    const { caption, imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ ok: false, message: '이미지 URL은 필수입니다' });
    }
    
    const image = await storage.createGalleryImage({
      url: imageUrl,
      caption: caption || null,
      visible: true
    });
    
    res.json({ ok: true, item: image });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({ ok: false, message: 'Failed to create gallery image' });
  }
});

// ✅ 동영상 목록
router.get('/videos', adminGuard, async (req, res) => {
  try {
    const courses = await storage.getCourses();
    const videos = [];
    
    for (const course of courses) {
      const courseVideos = await storage.getVideosByCourse(course.id);
      videos.push(...courseVideos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.externalUrl,
        courseName: course.title
      })));
    }
    
    res.json({ ok: true, items: videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch videos' });
  }
});

// ✅ 동영상 추가
router.post('/videos', adminGuard, async (req, res) => {
  try {
    const { title, description, videoUrl } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ ok: false, message: '제목과 동영상 URL은 필수입니다' });
    }
    
    // 기본 코스 생성 또는 가져오기
    let course;
    const courses = await storage.getCourses();
    const defaultCourse = courses.find(c => c.title === '관리자 업로드');
    
    if (!defaultCourse) {
      course = await storage.createCourse({
        slug: 'admin-uploads',
        title: '관리자 업로드',
        description: '관리자가 업로드한 동영상들',
        order: 999
      });
    } else {
      course = defaultCourse;
    }
    
    const video = await storage.createVideo({
      title,
      description: description || null,
      externalUrl: videoUrl,
      courseId: course.id
    });
    
    res.json({ ok: true, item: video });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ ok: false, message: 'Failed to create video' });
  }
});

export default router;