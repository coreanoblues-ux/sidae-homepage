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
  if (isHttps(req)) {
    return { httpOnly: true, secure: true, sameSite: "none" as const,
             domain: domainFor(req.hostname), path: "/" };
  }
  return { httpOnly: true, secure: false, sameSite: "lax" as const,
           domain: undefined, path: "/" };          // dev/HTTP
}