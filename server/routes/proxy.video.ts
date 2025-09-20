// 🎬 NAS HTTP 동영상 프록시
// HTTPS 사이트에서 HTTP NAS 동영상을 재생하기 위한 프록시 엔드포인트

import { Router } from 'express';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const router = Router();

// 🔒 NAS 도메인 화이트리스트 (보안을 위해 활성화)
const ALLOWED_HOSTS = [
  'nas.sidae-edu.com',      // 시대영재 학원 NAS 도메인
  'sidae-nas.local',         // 로컬 NAS 도메인
  '192.168.0.100',          // NAS IP #1
  '192.168.0.200',          // NAS IP #2
  '192.168.1.100',          // 추가 NAS IP
  '10.0.0.100',             // 내부망 NAS
  'localhost',              // 개발용
  '127.0.0.1',              // 개발용
  // 필요한 NAS 도메인/IP를 여기에 추가하세요
];

router.get('/proxy/video', async (req, res) => {
  try {
    const raw = String(req.query.u || '');
    
    if (!raw) {
      return res.status(400).json({ 
        ok: false, 
        code: 'MISSING_URL',
        message: 'URL parameter is required' 
      });
    }
    
    // URL 파싱 및 검증
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(raw);
    } catch (error) {
      return res.status(400).json({ 
        ok: false, 
        code: 'INVALID_URL',
        message: 'Invalid URL format' 
      });
    }
    
    // 프로토콜 검증 (http/https만 허용)
    if (!/^https?:$/.test(parsedUrl.protocol)) {
      return res.status(400).json({ 
        ok: false, 
        code: 'INVALID_PROTOCOL',
        message: 'Only HTTP and HTTPS protocols are allowed' 
      });
    }
    
    // 🔒 호스트 화이트리스트 체크 (보안 강화)
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      console.log(`❌ Proxy request blocked for host: ${parsedUrl.hostname}`);
      return res.status(403).json({ 
        ok: false, 
        code: 'HOST_NOT_ALLOWED',
        message: 'This host is not allowed for proxy access' 
      });
    }
    
    console.log(`✅ Proxying video from: ${parsedUrl.hostname}`);
    
    // Range 헤더 전달 (비디오 시킹/스트리밍을 위해 필수)
    const headers: any = {};
    const range = req.headers.range;
    if (range) {
      headers['Range'] = range;
    }
    
    // HTTP/HTTPS 클라이언트 선택
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    // 프록시 요청 생성
    const proxyRequest = client.request(parsedUrl, { headers }, (upstream) => {
      // 상태 코드 전달
      res.statusCode = upstream.statusCode || 200;
      
      // 필요한 헤더만 선택적으로 전달
      const passHeaders = [
        'content-type',
        'content-length',
        'accept-ranges',
        'content-range',
        'cache-control',
        'etag',
        'last-modified'
      ];
      
      passHeaders.forEach(headerName => {
        const headerValue = upstream.headers[headerName];
        if (headerValue) {
          res.setHeader(headerName, headerValue as any);
        }
      });
      
      // CORS 헤더 추가 (동영상 태그에서 접근 가능하도록)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      
      // 스트림 파이프
      upstream.pipe(res);
    });
    
    // 에러 처리
    proxyRequest.on('error', (err) => {
      console.error('❌ Proxy error:', err);
      
      // 이미 응답이 시작된 경우 처리하지 않음
      if (res.headersSent) {
        return res.end();
      }
      
      res.status(502).json({ 
        ok: false, 
        code: 'PROXY_ERROR', 
        message: `Failed to fetch video: ${err.message || err}` 
      });
    });
    
    // 클라이언트 연결 종료 시 프록시 요청도 종료
    req.on('close', () => {
      proxyRequest.destroy();
    });
    
    // 프록시 요청 전송
    proxyRequest.end();
    
  } catch (error: any) {
    console.error('❌ Proxy server error:', error);
    res.status(500).json({ 
      ok: false, 
      code: 'SERVER_ERROR',
      message: 'Internal proxy server error' 
    });
  }
});

// OPTIONS 요청 처리 (CORS preflight)
router.options('/proxy/video', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

export default router;