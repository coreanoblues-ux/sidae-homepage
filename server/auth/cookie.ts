import type { Request } from "express";

function canonicalDomain(host?: string) {
  if (!host) return undefined;                // host-only (로컬/Vite)
  if (host.endsWith(".replit.app"))  return ".replit.app";
  if (host.endsWith("sidae-edu.com")) return ".sidae-edu.com";
  // 🎯 .replit.dev는 domain 설정 안 함 (host-only)
  return undefined;
}

export function cookieOptions(req: Request) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  const isHttps = proto === "https";
  const hostname = req.hostname || "";

  console.log('🍪 쿠키 옵션 생성:', { 
    proto, 
    isHttps, 
    hostname,
    'x-forwarded-proto': req.headers["x-forwarded-proto"]
  });

  // 🎯 .replit.dev 개발환경은 특별 처리
  if (hostname.includes(".replit.dev")) {
    console.log('🔧 .replit.dev 개발환경 - 단순한 쿠키 설정 사용');
    return {
      httpOnly: true,
      secure: true,      // HTTPS이지만
      sameSite: "lax" as const,  // same-origin이므로 lax
      // domain 설정 없음 (host-only)
      path: "/",
    };
  }

  // 🔑 나머지 환경: HTTPS면 SameSite=None + Secure, HTTP면 Lax + Secure=false
  if (isHttps) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      domain: canonicalDomain(req.hostname),
      path: "/",
    };
  } else {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      domain: undefined, // 로컬/개발은 host-only 권장
      path: "/",
    };
  }
}