import type { Request } from "express";

function canonicalDomain(host?: string) {
  if (!host) return undefined;                // host-only (로컬/Vite)
  if (host.endsWith(".replit.dev"))  return ".replit.dev";
  if (host.endsWith(".replit.app"))  return ".replit.app";
  if (host.endsWith("sidae-edu.com")) return ".sidae-edu.com";
  return undefined;
}

export function cookieOptions(req: Request) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  const isHttps = proto === "https";

  console.log('🍪 쿠키 옵션 생성:', { 
    proto, 
    isHttps, 
    hostname: req.hostname,
    'x-forwarded-proto': req.headers["x-forwarded-proto"]
  });

  // 🔑 HTTPS면 SameSite=None + Secure, HTTP면 Lax + Secure=false
  if (isHttps) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,  // 🎯 소문자로 수정
      domain: canonicalDomain(req.hostname),
      path: "/",
    };
  } else {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,   // 🎯 소문자로 수정
      domain: undefined, // 로컬/개발은 host-only 권장
      path: "/",
    };
  }
}