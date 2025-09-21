import type { Request } from 'express';

const domainFor = (host?: string) => {
  if (!host) return undefined; // dev/host-only
  // 🎯 Replit 환경은 host-only 쿠키 사용 (서브도메인 문제 해결)
  if (host.includes('.replit.app') || host.includes('.replit.dev')) return undefined;
  if (host.endsWith('sidae-edu.com')) return '.sidae-edu.com';
  return undefined;
};

export function cookieOpts(req: Request) {
  const https = ((req.headers['x-forwarded-proto'] as string) || 'http') === 'https';
  return https
    ? { httpOnly:true, secure:true,  sameSite:'None' as const, domain:domainFor(req.hostname), path:'/' }
    : { httpOnly:true, secure:false, sameSite:'Lax'  as const, domain:undefined,               path:'/' };
}