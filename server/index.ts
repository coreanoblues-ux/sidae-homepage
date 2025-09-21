import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedProgramsIfEmpty } from "./seedData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🎯 배포 환경 설정 (가이드 적용)
app.set('trust proxy', 1); // 프록시 신뢰 설정

// 환경변수 정합 
const frontOrigin = process.env.FRONT_ORIGIN || 'https://sidae-edu.com';
const apiOrigin = process.env.API_ORIGIN || 'https://sidae-edu.com';

// CORS/프록시 차이 제거 - 명시적 CORS 설정
app.use(cors({ 
  origin: process.env.FRONT_ORIGIN,  // dev/배포 각각 실제 Origin 값
  credentials: true 
}));

// 🎯 auth 상태는 캐시 금지
app.use((_, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// 🔒 JWT 기반 관리자 인증 체크 헬퍼
const isAdmin = (req: any) => {
  const raw = req.cookies?.sid || (req.headers.cookie||"").split(/; */)
    .map((s: string) => s.split("=")).reduce((a: any, [k, v]: any) => (a[k] = decodeURIComponent(v||""), a), {} as any).sid;
  if (!raw) return false;
  try { 
    const p: any = jwt.verify(raw, process.env.JWT_SECRET!); 
    return p?.role==="admin"; 
  }
  catch { return false; }
};

// 📁 uploads 디렉토리 정적 파일 서빙 설정 (API/정적/SPA보다 위에 위치)
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(UPLOAD_DIR, {
  fallthrough: false,
  setHeaders(res) { 
    res.setHeader("Cache-Control", "public, max-age=3600"); 
  }
}));

const INDEX = path.join(__dirname, "dist/index.html");

(async () => {
  const server = await registerRoutes(app);

  // 🌱 시드 데이터 초기화 (배포 환경에서 프로그램 데이터 없을 때 자동 생성)
  await seedProgramsIfEmpty();

  // 🔒 보호 페이지 서버 가드 (관리자 로그인 필요)
  const PROTECTED = ["/admin", "/admin-dashboard"];
  app.get(PROTECTED, (req, res) => {
    console.log('🚨 보호된 페이지 접근:', req.path, '- 관리자 인증:', isAdmin(req) ? '✅' : '❌');
    if (!isAdmin(req)) {
      console.log('🔄 /_superadmin으로 리다이렉트');
      return res.redirect(302, "/_superadmin");
    }
    res.sendFile(INDEX);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
