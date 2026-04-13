import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (false) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // 🎯 개발/배포 환경 대응 세션 쿠키 설정
  const isDev = process.env.NODE_ENV === 'development';
  const cookieDomain = process.env.COOKIE_DOMAIN;
  
  const cookieConfig: any = {
    httpOnly: true,
    secure: !isDev, // 개발환경은 false, 배포환경은 true
    sameSite: isDev ? 'lax' : 'none', // 개발환경은 lax, 배포환경은 none
    path: '/',
    maxAge: sessionTtl,
  };

  // 배포환경에서만 도메인 설정
  if (!isDev && cookieDomain) {
    cookieConfig.domain = cookieDomain;
  }
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: cookieConfig,
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

// 🎯 세션 + passport만 설정 (Replit OIDC 없이) - Railway 배포용
export function setupSessionOnly(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  // 🎯 강화된 관리자 로그아웃 (POST) - 변종 쿠키 완전 제거
  app.post('/api/auth/logout', (req, res) => {
    const { cookieOpts } = require('./auth/cookie');
    const opts = cookieOpts(req);
    
    // 세션 무효화 (Passport 세션)
    req.logout(() => {});
    
    // 메인 쿠키 제거
    res.clearCookie('sid', opts);
    res.clearCookie('connect.sid', opts);
    res.cookie('sid', '', { ...opts, maxAge: 0 });
    res.cookie('connect.sid', '', { ...opts, maxAge: 0 });

    // 🎯 강화된 변종 쿠키 제거 - 모든 도메인/경로 조합
    const allDomains = [undefined, '.sidae-edu.com', '.replit.app', '.replit.dev', '.replit.co'];
    const allPaths = ['/', '/api'];
    allDomains.forEach(domain => {
      allPaths.forEach(path => {
        ['sid', 'connect.sid'].forEach(name => {
          // 즉시 만료 쿠키 설정 (다양한 조합으로)
          res.clearCookie(name, { domain, path, secure: true, sameSite: 'none' as const });
          res.cookie(name, '', { domain, path, expires: new Date(0), secure: true, sameSite: 'none' as const });
          res.cookie(name, '', { domain, path, maxAge: 0, secure: true, sameSite: 'none' as const });
        });
      });
    });

    // 현재 호스트용 쿠키도 제거
    ['sid', 'connect.sid'].forEach(name => {
      res.clearCookie(name, { expires: new Date(0), httpOnly: true, secure: true, sameSite: 'none' as const });
      res.cookie(name, '', { expires: new Date(0), httpOnly: true, secure: true, sameSite: 'none' as const, maxAge: 0 });
      res.cookie(name, '', { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), httpOnly: true, secure: true, sameSite: 'none' as const });
      res.cookie(name, '', { expires: new Date(), maxAge: 0, secure: true, sameSite: 'none' as const });
    });
    
    // 강력한 캐시 방지 헤더
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({ ok: true, loggedOut: true, message: '로그아웃되었습니다' });
  });

  // 🎯 학생 전용 로그아웃 (POST) - 완전한 쿠키 제거
  app.post('/api/auth/student-logout', (req, res) => {
    const { cookieOpts } = require('./auth/cookie');
    const opts = cookieOpts(req);
    
    // 세션 무효화 (Passport 세션)
    req.logout(() => {});
    
    // 메인 쿠키 제거 (현재 옵션으로)
    res.clearCookie('sid', opts);
    res.clearCookie('connect.sid', opts);
    res.cookie('sid', '', { ...opts, maxAge: 0 });
    res.cookie('connect.sid', '', { ...opts, maxAge: 0 });

    // 🎯 변종 쿠키 완전 제거 - 모든 가능한 도메인/경로 조합
    const domains = [undefined, '.sidae-edu.com', '.replit.app', '.replit.dev', '.replit.co'];
    const paths = ['/', '/api'];
    
    domains.forEach(domain => {
      paths.forEach(path => {
        ['sid', 'connect.sid'].forEach(cookieName => {
          // 다양한 삭제 방법 시도 (브라우저별 호환성)
          res.clearCookie(cookieName, { domain, path, secure: true, sameSite: 'none' as const });
          res.cookie(cookieName, '', { domain, path, expires: new Date(0), secure: true, sameSite: 'none' as const });
          res.cookie(cookieName, '', { domain, path, maxAge: 0, secure: true, sameSite: 'none' as const });
        });
      });
    });

    // 호스트 전용 쿠키도 제거 (현재 요청 호스트)
    ['sid', 'connect.sid'].forEach(cookieName => {
      res.clearCookie(cookieName, { expires: new Date(0), httpOnly: true, secure: true, sameSite: 'none' as const });
      res.cookie(cookieName, '', { expires: new Date(0), httpOnly: true, secure: true, sameSite: 'none' as const, maxAge: 0 });
      res.cookie(cookieName, '', { expires: new Date(), maxAge: 0, secure: true, sameSite: 'none' as const });
    });
    
    // 강력한 캐시 방지 헤더 
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({ ok: true, loggedOut: true, message: '안전하게 로그아웃되었습니다' });
  });

  // 🎯 기존 GET 로그아웃 (호환성 유지)
  app.get("/api/logout", (req, res) => {
    // 환경변수 기반 통일된 쿠키 옵션
    const cookieDomain = process.env.COOKIE_DOMAIN || 'sidae-edu.com';
    const cookieOpts = { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' as const, 
      domain: cookieDomain, 
      path: '/' 
    };
    
    // 관리자 쿠키가 있으면 먼저 정리
    if (req.cookies?.sid === 'admin-token') {
      res.clearCookie('sid', cookieOpts);
      res.cookie('sid', '', { ...cookieOpts, maxAge: 0 });
      return res.redirect("/");
    }
    
    // 일반 Replit OAuth 로그아웃
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  // 관리자 비밀번호 로그인 (개발 및 배포 환경 모두 지원)
  app.post("/api/dev/login", async (req, res) => {
    const { password } = req.body;
    const correctPassword = process.env.SUPERADMIN_PASSWORD || "671321";
      
      if (password !== correctPassword) {
        return res.status(401).json({ message: "잘못된 비밀번호입니다." });
      }

      // 개발용 관리자 사용자 생성/업데이트
      await storage.upsertUser({
        id: "dev-admin",
        email: "admin@sidaeyeongjae.kr",
        firstName: "관리자",
        lastName: "개발용",
        profileImageUrl: null,
        role: "ADMIN"
      });

      // 쿠키 설정 - 도메인 체크 개선
      const host = req.get('host') || '';
      const isReplitApp = host.includes('replit.app');
      const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
      
      console.log('[SET-COOKIE] Host:', host); // 진단 로그
      
      // 개발용 세션 쿠키 설정 - 도메인별로 다르게 처리
      const cookieOptions: any = {
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1주일
      };
      
      if (isReplitApp || isLocalhost) {
        // Replit 또는 로컬 환경 - 도메인 설정하지 않음
        if (isReplitApp) {
          cookieOptions.secure = true;
          cookieOptions.sameSite = 'none';
        }
      } else {
        // 커스텀 도메인 환경
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'none';
        cookieOptions.domain = process.env.COOKIE_DOMAIN || 'sidae-edu.com';
      }
      
      res.cookie('sid', 'admin-token', cookieOptions);

      res.json({ success: true, message: "개발용 로그인 성공" });
    });

  app.post("/api/dev/logout", (req, res) => {
    // 쿠키 정리 - 도메인별로 처리
    const host = req.get('host') || '';
    const isReplitApp = host.includes('replit.app');
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    
    const cookieOpts: any = { 
      httpOnly: true, 
      path: '/' 
    };
    
    if (isReplitApp || isLocalhost) {
      // Replit 또는 로컬 환경
      if (isReplitApp) {
        cookieOpts.secure = true;
        cookieOpts.sameSite = 'none';
      }
    } else {
      // 커스텀 도메인 환경
      cookieOpts.secure = true;
      cookieOpts.sameSite = 'none';
      cookieOpts.domain = process.env.COOKIE_DOMAIN || 'sidae-edu.com';
    }
    
    res.clearCookie('sid', cookieOpts);
    res.cookie('sid', '', { ...cookieOpts, maxAge: 0 });
    
    res.json({ success: true, message: "로그아웃 완료" });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // 개발/배포 환경에서 관리자 쿠키 확인
  if (req.cookies?.sid === 'admin-token') {
    // 개발용 세션 생성
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

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
