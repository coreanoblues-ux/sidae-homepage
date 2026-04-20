import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/shared/Layout";
import { useAuth } from "@/hooks/useAuth";

// 🎯 즉시 로딩 (첫 화면에 필요한 페이지만)
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// 🚀 코드 스플리팅 - 필요할 때만 로딩
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Courses = lazy(() => import("@/pages/courses"));
const CourseDetail = lazy(() => import("@/pages/course-detail"));
const Gallery = lazy(() => import("@/pages/gallery"));
const Account = lazy(() => import("@/pages/account"));
const Members = lazy(() => import("@/pages/members"));
const Videos = lazy(() => import("@/pages/Videos"));
const ProgramPage = lazy(() => import("@/pages/program"));
const LocationPage = lazy(() => import("@/pages/location"));

// 🔒 관리자 페이지 - 별도 청크로 분리
const Admin = lazy(() => import("@/pages/admin"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminMembers = lazy(() => import("@/pages/admin/members"));
const AdminVideos = lazy(() => import("@/pages/admin/videos"));
const AdminCourses = lazy(() => import("@/pages/admin/courses"));
const AdminNotices = lazy(() => import("@/pages/admin/notices"));
const SuperAdmin = lazy(() => import("@/pages/superadmin"));
const SimpleAdmin = lazy(() => import("@/pages/simple-admin"));
const NewAdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));

// 로딩 스피너
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Redirect component for route aliases
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

// Protected Route Component - Enhanced with role-based access
function ProtectedRoute({ children, requireAuth = true, allowedRoles }: { 
  children: React.ReactNode; 
  requireAuth?: boolean;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // 리다이렉트 로직을 useEffect로 이동 (React 경고 해결)
  useEffect(() => {
    if (isLoading) return;
    
    if (requireAuth && !isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = (user as any)?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        setLocation('/');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, allowedRoles, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  // 인증 확인 중이거나 리다이렉트가 필요한 경우
  if (requireAuth && !isAuthenticated) {
    return null; // useEffect에서 리다이렉트 처리
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user as any)?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return null; // useEffect에서 리다이렉트 처리
    }
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Switch>
      {/* Public Routes - 모든 사용자가 접근 가능 */}
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/courses" component={Courses} />
      <Route path="/videos">
        <ProtectedRoute requireAuth={true} allowedRoles={["VERIFIED", "ADMIN"]}>
          <Videos />
        </ProtectedRoute>
      </Route>
      <Route path="/gallery" component={Gallery} />
      <Route path="/program/:slug" component={ProgramPage} />

      {/* 네이버 지역 SEO — 봉선동 영어학원 오시는 길 랜딩 */}
      <Route path="/location" component={LocationPage} />
      
      {/* Curriculum routes - redirect to program pages */}
      <Route path="/curriculum/middle">
        <Redirect to="/program/middle-school" />
      </Route>
      <Route path="/curriculum/high">
        <Redirect to="/program/high-school" />
      </Route>
      
      <Route path="/login" component={Login} />
      
      {/* Protected Routes - 인증 필요 */}
      <Route path="/courses/:id">
        <ProtectedRoute requireAuth={true}>
          <CourseDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/account">
        <ProtectedRoute requireAuth={true}>
          <Account />
        </ProtectedRoute>
      </Route>
      
      {/* Members Only Routes - VERIFIED 회원만 */}
      <Route path="/members">
        <ProtectedRoute requireAuth={true} allowedRoles={["VERIFIED"]}>
          <Members />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Only Routes - 관리자만 */}
      <Route path="/admin">
        <ProtectedRoute requireAuth={true} allowedRoles={["ADMIN"]}>
          <Admin />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute requireAuth={true} allowedRoles={["ADMIN"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/members">
        <ProtectedRoute requireAuth={true} allowedRoles={["ADMIN"]}>
          <AdminMembers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/videos">
        <ProtectedRoute requireAuth={true} allowedRoles={["ADMIN"]}>
          <AdminVideos />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/courses">
        <ProtectedRoute requireAuth={true} allowedRoles={["ADMIN"]}>
          <AdminCourses />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/notices">
        <ProtectedRoute requireAuth={true} allowedRoles={["ADMIN"]}>
          <AdminNotices />
        </ProtectedRoute>
      </Route>
      
      {/* Superadmin routes - 비밀번호 입력으로 바로 접근 가능 */}
      <Route path="/_superadmin" component={SuperAdmin} />
      
      {/* Simple Admin - 새로운 단순한 관리자 페이지 */}
      <Route path="/simple-admin" component={SimpleAdmin} />
      
      {/* New Admin System */}
      <Route path="/_superadmin" component={AdminLoginPage} />
      <Route path="/admin-dashboard" component={NewAdminDashboard} />
      
      {/* Remove public aliases for security */}
      
      {/* Explicit 404 route */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function AppContent() {
  const [location] = useLocation();

  // 독립적인 관리자 페이지들 - Layout 없이 렌더링
  if (location === '/_superadmin') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Toaster />
        <AdminLoginPage />
      </Suspense>
    );
  }

  if (location === '/admin-dashboard') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Toaster />
        <NewAdminDashboard />
      </Suspense>
    );
  }

  if (location === '/simple-admin') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Toaster />
        <SimpleAdmin />
      </Suspense>
    );
  }

  // 나머지 페이지는 기존대로 Layout 사용
  return (
    <Layout>
      <Toaster />
      <Router />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AppContent />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
