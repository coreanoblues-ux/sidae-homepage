import { Switch, Route, useLocation } from "wouter";
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
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Gallery from "@/pages/gallery";
import Account from "@/pages/account";
import Admin from "@/pages/admin";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMembers from "@/pages/admin/members";
import AdminVideos from "@/pages/admin/videos";
import AdminCourses from "@/pages/admin/courses";
import AdminNotices from "@/pages/admin/notices";
import SuperAdmin from "@/pages/superadmin";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/about" component={About} />
          <Route path="/courses" component={Courses} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/program/:slug" component={ProgramPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/courses" component={Courses} />
          <Route path="/courses/:id" component={CourseDetail} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/program/:slug" component={ProgramPage} />
          <Route path="/account" component={Account} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/members" component={AdminMembers} />
          <Route path="/admin/videos" component={AdminVideos} />
          <Route path="/admin/courses" component={AdminCourses} />
          <Route path="/admin/notices" component={AdminNotices} />
        </>
      )}
      
      {/* Superadmin routes - secret paths (outside auth check to prevent 404) */}
      <Route path="/_superadmin" component={SuperAdmin} />
      
      {/* Route aliases to prevent 404 - redirect to secret path */}
      <Route path="/superadmin" component={() => <Redirect to="/_superadmin" />} />
      <Route path="/super-admin" component={() => <Redirect to="/_superadmin" />} />
      <Route path="/admin/super" component={() => <Redirect to="/_superadmin" />} />
      
      {/* Explicit 404 route */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Toaster />
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
