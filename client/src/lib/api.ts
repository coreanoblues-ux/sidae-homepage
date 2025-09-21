// src/lib/api.ts
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Primitive = string | number | boolean | null | undefined;

export type Query = Record<string, Primitive | Primitive[]>;

export interface ApiRequestInit<TBody = unknown> extends Omit<RequestInit, 'body' | 'method'> {
  method?: ApiMethod;
  body?: TBody; // JSON | FormData | undefined
}

function toQueryString(q?: Query) {
  if (!q) return '';
  const usp = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(x => usp.append(k, String(x)));
    else if (v !== undefined && v !== null) usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

function isFormData(x: unknown): x is FormData {
  return typeof FormData !== 'undefined' && x instanceof FormData;
}

/**
 * 안전한 API 요청 래퍼 (완전 제네릭)
 * 사용 예)
 *   const user = await apiRequest<User>('/api/me');
 *   const created = await apiRequest<Post, NewPost>('/api/posts', { method:'POST', body: newPost });
 *   const list = await apiGet<Post[]>('/api/posts', { query: { page:1, tags:['a','b'] } });
 */
export async function apiRequest<TResponse, TBody = unknown>(
  url: string,
  init: ApiRequestInit<TBody> = {}
): Promise<TResponse> {
  const { body, headers, method = 'GET', ...rest } = init;

  const finalHeaders = new Headers(headers);
  let finalBody: BodyInit | undefined = undefined;

  if (body !== undefined) {
    if (isFormData(body)) {
      finalBody = body as unknown as BodyInit;
      // FormData는 Content-Type 자동 세팅(절대 수동 지정 금지)
    } else {
      finalHeaders.set('Content-Type', 'application/json');
      finalBody = JSON.stringify(body);
    }
  }

  // credentials: 'include' 추가하여 세션 쿠키 포함
  finalHeaders.set('credentials', 'include');
  
  const res = await fetch(url, { 
    method, 
    headers: finalHeaders, 
    body: finalBody, 
    credentials: 'include',
    ...rest 
  });
  
  if (!res.ok) {
    // 🎯 가이드 1) 401 처리 - 보호된 경로에서만 팝업
    if (res.status === 401) {
      // 보호 경로에서만 안내/리다이렉트 
      if (typeof window !== 'undefined') {
        const { isProtectedPath } = await import('@/lib/routeGuard');
        if (isProtectedPath(location.pathname)) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          location.assign("/login?next=" + encodeURIComponent(location.pathname));
        }
      }
      // 공개 경로면 조용히 실패만 반환
      throw new Error(`API ${method} ${url} ${res.status}: Unauthorized`);
    }
    
    const text = await res.text().catch(() => '');
    throw new Error(`API ${method} ${url} ${res.status}: ${text}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as TResponse;
  // 필요 시 다른 타입(add): Blob, text 등
  return (await res.text()) as unknown as TResponse;
}

export async function apiGet<TResponse>(url: string, opts?: { query?: Query; init?: ApiRequestInit }) {
  const qs = toQueryString(opts?.query);
  return apiRequest<TResponse>(`${url}${qs}`, { method: 'GET', ...(opts?.init || {}) });
}

// 🎯 API 요청 (캐시 무시)
export async function api(input: RequestInfo, init: RequestInit = {}) {
  const r = await fetch(input, { credentials: 'include', cache: 'no-store', ...init });
  if (r.status === 401 && location.pathname.startsWith('/admin')) {
    location.assign('/_superadmin?next=' + encodeURIComponent(location.pathname));
  }
  return r;
}

// 🎯 강화된 하드 로그아웃 (완전 정리)
export async function hardLogout(navigate = (p: string) => location.assign(p)) {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    .catch(() => {});
  localStorage.clear(); 
  sessionStorage.clear();
  navigate('/'); // 홈으로
  // 캐시 무시하고 재검증(무음)
  await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
}