import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { isProtectedPath } from "@/lib/routeGuard";

// 🎯 가이드 1) 401 처리 개선 - 보호된 경로에서만 팝업
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // 🔑 401 처리: 보호된 경로에서만 알림
    if (res.status === 401) {
      if (isProtectedPath(location.pathname)) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        location.assign("/login?next=" + encodeURIComponent(location.pathname));
      }
      // 공개 경로에서는 조용히 실패
      throw new Error(`${res.status}: Unauthorized`);
    }
    
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
