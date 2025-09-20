import type { Request } from "express";

const isHttps = (req: Request) =>
  (req.headers["x-forwarded-proto"] as string) === "https";

const domainFor = (host?: string) => {
  if (!host) return undefined;                      // dev(host-only)
  if (host.endsWith(".replit.app"))  return ".replit.app";
  if (host.endsWith(".replit.dev"))  return undefined; // 🎯 .replit.dev는 host-only 필수
  if (host.endsWith("sidae-edu.com"))return ".sidae-edu.com";
  return undefined;
};

export function cookieOpts(req: Request) {
  const hostname = req.hostname || "";
  
  // 🎯 .replit.app와 .replit.dev 모두 same-origin이므로 단순한 설정 사용
  if (hostname.includes(".replit.")) {
    console.log('🔧 Replit 환경 - 단순한 쿠키 설정 사용');
    return {
      httpOnly: true,
      secure: true,      // HTTPS 환경
      sameSite: "lax" as const,  // same-origin이므로 lax
      // domain 설정 없음 (host-only) - 가장 안전함
      path: "/",
    };
  }
  
  // 🔑 기타 환경: HTTPS면 cross-domain 설정, HTTP면 기본 설정
  if (isHttps(req)) {
    return { httpOnly: true, secure: true, sameSite: "none" as const,
             domain: domainFor(req.hostname), path: "/" };
  }
  return { httpOnly: true, secure: false, sameSite: "lax" as const,
           domain: undefined, path: "/" };          // dev/HTTP
}