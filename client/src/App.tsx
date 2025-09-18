import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/shared/Layout";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import About from "@/pages/about";
import Login from "@/pages/login";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Gallery from "@/pages/gallery";
import Account from "@/pages/account";
import Members from "@/pages/members";
import Admin from "@/pages/admin";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMembers from "@/pages/admin/members";
import AdminVideos from "@/pages/admin/videos";
import AdminCourses from "@/pages/admin/courses";
import AdminNotices from "@/pages/admin/notices";
import SuperAdmin from "@/pages/superadmin";
import SimpleAdmin from "@/pages/simple-admin";
import ProgramPage from "@/pages/program";
import NotFound from "@/pages/not-found";

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

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (requireAuth && !isAuthenticated) {
    setLocation('/login');
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user as any)?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      setLocation('/');
      return null;
    }
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes - 모든 사용자가 접근 가능 */}
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/courses" component={Courses} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/program/:slug" component={ProgramPage} />
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
      
      {/* Remove public aliases for security */}
      
      {/* Explicit 404 route */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  
  // /_superadmin과 /simple-admin 경로는 Layout 없이 렌더링 (독립적인 페이지)
  if (location === '/_superadmin') {
    return (
      <>
        <Toaster />
        <SuperAdmin />
      </>
    );
  }
  
  if (location === '/simple-admin') {
    return (
      <>
        <Toaster />
        <SimpleAdmin />
      </>
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
