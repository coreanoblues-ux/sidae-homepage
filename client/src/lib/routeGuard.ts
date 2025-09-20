// 🎯 가이드 1) 보호된 경로 구분 (401 팝업 제어용)
export function isProtectedPath(path: string) {
  return path.startsWith("/admin") || 
         path.startsWith("/student") || 
         path.startsWith("/videos");
}