import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Users, 
  Video, 
  BookOpen, 
  Calendar, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  verifiedUsers: number;
  totalCourses: number;
  totalVideos: number;
  totalNotices: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      toast({
        title: "접근 권한이 없습니다",
        description: "관리자만 접근할 수 있는 페이지입니다.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: pendingUsers = [], error: pendingUsersError } = useQuery({
    queryKey: ["/api/admin/users/pending"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // Handle pendingUsers query errors
  useEffect(() => {
    if (pendingUsersError && isUnauthorizedError(pendingUsersError as Error)) {
      toast({
        title: "인증이 필요합니다",
        description: "다시 로그인해주세요.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [pendingUsersError, toast]);

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/admin/courses"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const { data: notices = [] } = useQuery({
    queryKey: ["/api/admin/notices"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-muted h-8 rounded w-64 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                접근 권한이 없습니다
              </h2>
              <p className="text-muted-foreground mb-4">
                관리자만 접근할 수 있는 페이지입니다.
              </p>
              <Button asChild>
                <Link href="/">홈으로 돌아가기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock stats - in a real app, this would come from the API
  const stats: DashboardStats = {
    totalUsers: 150,
    pendingUsers: pendingUsers.length,
    verifiedUsers: 125,
    totalCourses: courses.length,
    totalVideos: 45,
    totalNotices: notices.length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">관리자 대시보드</h1>
            <p className="text-xl text-muted-foreground">
              학원 운영 현황을 한눈에 확인하고 관리하세요
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Card */}
        <Card className="mb-8" data-testid="card-welcome">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  환영합니다, {user.firstName || "관리자"}님!
                </h2>
                <p className="text-muted-foreground">
                  정우석 영어학원 관리 시스템에 로그인되었습니다.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  마지막 로그인: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-stat-pending">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">승인 대기</p>
                  <p className="text-3xl font-bold text-foreground">{stats.pendingUsers}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild data-testid="button-manage-pending">
                  <Link href="/admin/members">
                    관리하기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-verified">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">인증 회원</p>
                  <p className="text-3xl font-bold text-foreground">{stats.verifiedUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  전체 {stats.totalUsers}명 중 {Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-courses">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">강의 과정</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalCourses}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild data-testid="button-manage-courses">
                  <Link href="/admin/courses">
                    관리하기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-videos">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">동영상</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalVideos}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild data-testid="button-manage-videos">
                  <Link href="/admin/videos">
                    관리하기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Approvals */}
          <Card data-testid="card-pending-approvals">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 w-5 h-5" />
                최근 가입 신청
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">승인 대기 중인 회원이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.slice(0, 5).map((user: any) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                      data-testid={`pending-user-${user.id}`}
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {user.firstName || user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/members">검토</Link>
                      </Button>
                    </div>
                  ))}
                  {pendingUsers.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/admin/members">
                          {pendingUsers.length - 5}명 더 보기
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 w-5 h-5" />
                빠른 작업
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-quick-members">
                  <Link href="/admin/members">
                    <div className="text-left">
                      <Users className="w-6 h-6 mb-2" />
                      <div className="font-semibold">회원 관리</div>
                      <div className="text-sm text-muted-foreground">
                        승인/거절 처리
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-quick-videos">
                  <Link href="/admin/videos">
                    <div className="text-left">
                      <Video className="w-6 h-6 mb-2" />
                      <div className="font-semibold">동영상 관리</div>
                      <div className="text-sm text-muted-foreground">
                        강의 업로드/편집
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-quick-courses">
                  <Link href="/admin/courses">
                    <div className="text-left">
                      <BookOpen className="w-6 h-6 mb-2" />
                      <div className="font-semibold">강의 관리</div>
                      <div className="text-sm text-muted-foreground">
                        과정 생성/정렬
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-quick-notices">
                  <Link href="/admin/notices">
                    <div className="text-left">
                      <Calendar className="w-6 h-6 mb-2" />
                      <div className="font-semibold">공지사항</div>
                      <div className="text-sm text-muted-foreground">
                        공지 작성/관리
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
