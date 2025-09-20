import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// 🎯 가이드 3) 공개 페이지에서는 401을 알림 없이 무시
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }), // 🔑 401시 null 반환 (팝업 없음)
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
