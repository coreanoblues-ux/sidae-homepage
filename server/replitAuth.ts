import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
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
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // 동적 쿠키 도메인 설정 (개발/운영 환경 지원)
  const isDev = process.env.NODE_ENV === 'development';
  const isReplit = !!process.env.REPL_ID;
  
  // 쿠키 설정을 환경에 따라 동적으로 구성
  const cookieConfig: any = {
    httpOnly: true,
    secure: !isDev, // 개발환경에서는 false, 운영환경에서는 true
    sameSite: isDev ? 'lax' : 'none', // 개발환경에서는 lax, 운영환경에서는 none
    path: '/',
    maxAge: sessionTtl,
  };

  // 운영환경에서만 domain 설정
  if (!isDev && !isReplit) {
    cookieConfig.domain = process.env.COOKIE_DOMAIN || 'sidae-edu.com';
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
