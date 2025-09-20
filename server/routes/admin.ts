import { Router } from 'express';
import { storage } from '../storage';
import { insertSimpleVideoSchema } from '../../shared/schema';
import { z } from 'zod';
import { normalizeVideo, VIDEO_ERROR_MESSAGES } from '../utils/videos';

const router = Router();

// 🎯 크롬 전용 이슈 방어를 포함한 Replit 쿠키 설정 (가이드 적용)
const cookieBase = {
  httpOnly: true,
  secure: true,             // 크롬은 SameSite=none일 때 필수
  sameSite: 'none' as const,
  domain: '.replit.app',    // 하위 도메인 모두 커버
  path: '/',
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
  
  // sid 쿠키 설정 (가이드: 로그인 시)
  res.cookie('sid', 'admin-token', { ...cookieBase, maxAge: 1000 * 60 * 60 });
  
  res.json({ ok: true, message: '로그인 성공' });
});

// ✅ 가이드에 따른 완전한 로그아웃 (Replit 환경 전용)
router.post('/logout', (req, res) => {
  console.log('🚪 로그아웃 시도 - Replit 환경');
  
  // 🔑 가이드 2) 크롬을 위한 모든 변종 쿠키 제거
  res.clearCookie('sid', { domain: '.replit.app', path: '/' });
  res.clearCookie('sid', { domain: 'edu-stream-1-coreanoblues.replit.app', path: '/' });
  res.clearCookie('sid', { path: '/' }); // 혹시 기본 도메인 쿠키 대비
  
  // 🔑 가이드 1) 로그아웃 시 (로그인과 100% 동일한 설정) - 크롬 완전 대응
  res.clearCookie('sid', cookieBase);
  
  console.log('✅ 로그아웃 완료 - 모든 쿠키 변종 삭제됨');
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
    } else if (status === 'verified') {
      const members = await storage.getVerifiedUsers();
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
    
    await storage.approveUser(userId, null, memo || '관리자 승인');
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
    
    await storage.rejectUser(userId, null, memo || '관리자 거부');
    res.json({ ok: true, message: '회원이 거부되었습니다' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ ok: false, message: 'Failed to reject user' });
  }
});

// ✅ 회원 승인 취소
router.post('/revoke-user', adminGuard, async (req, res) => {
  try {
    const { userId, memo } = req.body;
    if (!userId) {
      return res.status(400).json({ ok: false, message: 'User ID is required' });
    }
    
    await storage.revokeUserApproval(userId, null, memo || '관리자 승인 취소');
    res.json({ ok: true, message: '회원 승인이 취소되었습니다' });
  } catch (error) {
    console.error('Error revoking user:', error);
    res.status(500).json({ ok: false, message: 'Failed to revoke user approval' });
  }
});

// ✅ 회원 탈퇴 처리 (DELETE)
router.delete('/members/:id', adminGuard, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ ok: false, message: 'User ID is required' });
    }
    
    // 사용자를 PENDING 상태로 변경 (실제 삭제 대신)
    await storage.revokeUserApproval(id, null, '관리자에 의한 탈퇴 처리');
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ ok: false, message: 'Member deletion failed' });
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

// 🎯 동영상 목록 (새로운 단순 구조)
router.get('/videos', adminGuard, async (req, res) => {
  try {
    const videos = await storage.getSimpleVideos();
    res.json(videos);
  } catch (error) {
    console.error('Error fetching simple videos:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// 🎯 동영상 추가 (새로운 단순 구조 + URL 정규화 + 상세 디버깅)
router.post('/videos', adminGuard, async (req, res) => {
  try {
    console.log('🎬 새로운 동영상 추가 요청 - RAW BODY:', JSON.stringify(req.body, null, 2));
    
    const { title, type, url } = req.body;
    
    console.log('📝 파싱된 필드들:');
    console.log('  - title:', title, '(타입:', typeof title, ')');
    console.log('  - type:', type, '(타입:', typeof type, ')');
    console.log('  - url:', url, '(타입:', typeof url, ')');
    
    // 필수 필드 검증
    if (!title || !type || !url) {
      console.log('❌ 필수 필드 누락:', { title: !!title, type: !!type, url: !!url });
      return res.status(400).json({ 
        ok: false, 
        code: 'MISSING_FIELDS',
        message: '제목, 타입, URL은 필수입니다.'
      });
    }
    
    try {
      // URL 정규화 및 검증
      console.log('🔧 URL 정규화 시작...');
      const normalized = normalizeVideo({ type, url });
      console.log('✅ URL 정규화 완료:', JSON.stringify(normalized, null, 2));
      
      // Zod validation 전 데이터 확인
      const dataForValidation = {
        title: title.trim(),
        type: normalized.type,
        url: normalized.url
      };
      console.log('🔍 Zod 검증 전 데이터:', JSON.stringify(dataForValidation, null, 2));
      
      // Zod validation 및 DB 저장
      const validatedData = insertSimpleVideoSchema.parse(dataForValidation);
      console.log('✅ Zod 검증 통과:', JSON.stringify(validatedData, null, 2));
      
      const video = await storage.createSimpleVideo(validatedData);
      console.log('✅ 동영상 DB 생성 완료:', JSON.stringify(video, null, 2));
      
      res.json({ 
        ok: true, 
        video 
      });
      
    } catch (error: any) {
      console.log('❌ 동영상 처리 오류 상세:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      // 비디오 정규화 에러 처리
      if (VIDEO_ERROR_MESSAGES[error.message]) {
        console.log('📍 비디오 정규화 에러:', error.message);
        return res.status(422).json({ 
          ok: false, 
          code: error.message,
          message: VIDEO_ERROR_MESSAGES[error.message]
        });
      }
      
      // Zod 검증 에러
      if (error instanceof z.ZodError) {
        console.log('📍 Zod 검증 에러:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          ok: false,
          code: 'VALIDATION_ERROR',
          message: 'Invalid video data',
          errors: error.errors
        });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('💥 서버 에러:', error);
    res.status(500).json({ 
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to create video' 
    });
  }
});

// 🎯 동영상 수정 (사용자 제안 방식 - JSON 응답 보장)
router.put('/videos/:id', adminGuard, async (req, res) => {
  try {
    const id = req.params.id;
    const title = String(req.body?.title ?? '').trim();
    
    if (!title) {
      return res.status(422).json({ 
        ok: false, 
        code: 'TITLE_REQUIRED' 
      });
    }
    
    await storage.updateSimpleVideo(id, { title });
    return res.json({ ok: true });
    
  } catch (error) {
    console.error('Error updating simple video:', error);
    return res.status(500).json({ 
      ok: false, 
      code: 'UPDATE_FAILED' 
    });
  }
});

// 🎯 동영상 삭제 (사용자 제안 방식 - JSON 응답 보장)
router.delete('/videos/:id', adminGuard, async (req, res) => {
  try {
    const id = req.params.id;
    await storage.deleteSimpleVideo(id);
    return res.json({ ok: true });
    
  } catch (error) {
    console.error('Error deleting simple video:', error);
    return res.status(500).json({ 
      ok: false, 
      code: 'DELETE_FAILED' 
    });
  }
});

// ✅ 갤러리 이미지 수정
router.put('/gallery/:id', adminGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ ok: false, message: '이미지 URL은 필수입니다' });
    }
    
    const image = await storage.updateGalleryImage(id, {
      url: imageUrl,
      caption: caption || null
    });
    
    res.json({ ok: true, item: image });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({ ok: false, message: 'Failed to update gallery image' });
  }
});

// ✅ 갤러리 이미지 삭제
router.delete('/gallery/:id', adminGuard, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteGalleryImage(id);
    res.json({ ok: true, message: '갤러리 이미지가 삭제되었습니다' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete gallery image' });
  }
});

export default router;