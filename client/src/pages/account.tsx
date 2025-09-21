import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { hardStudentLogout } from "@/lib/api";
import { User, Calendar, CheckCircle, XCircle, Clock, LogOut, Edit, Shield, Award } from "lucide-react";

interface Approval {
  id: string;
  status: "APPROVED" | "REJECTED";
  memo?: string;
  createdAt: string;
}

export default function Account() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🎯 학생 전용 로그아웃 핸들러
  const handleStudentLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    
    try {
      await hardStudentLogout();
      
      // 🎯 로그아웃 후 TanStack Query 캐시 완전 정리
      queryClient.clear(); // 모든 캐시 정리로 충분
      
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다.",
      });
    } catch (error) {
      toast({
        title: "로그아웃 실패", 
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
      console.error('Student logout failed:', error);
    }
  };

  const { data: approvals = [] } = useQuery<Approval[]>({
    queryKey: ["/api/user/approvals", user?.id],
    enabled: !!user?.id,
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200";
      case "VERIFIED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "VERIFIED":
        return "인증 회원";
      case "PENDING":
        return "승인 대기";
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "모든 관리 기능과 강의에 접근할 수 있습니다.";
      case "VERIFIED":
        return "모든 강의를 수강할 수 있습니다.";
      case "PENDING":
        return "관리자의 승인 후 강의를 수강할 수 있습니다.";
      default:
        return "알 수 없는 상태입니다.";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                로그인이 필요합니다
              </h2>
              <p className="text-muted-foreground mb-4">
                계정 정보를 확인하려면 로그인해주세요.
              </p>
              <Button asChild data-testid="button-login">
                <a href="/api/login">로그인하기</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">내 계정</h1>
            <p className="text-xl text-muted-foreground">
              계정 정보와 학습 현황을 확인하세요
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card data-testid="card-profile">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {user.firstName || user.email}
                </CardTitle>
                <Badge className={`${getRoleBadgeColor(user.role)} mx-auto`}>
                  {getRoleLabel(user.role)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  {getRoleDescription(user.role)}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이메일</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">가입일</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">최근 업데이트</span>
                    <span className="font-medium">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full" disabled data-testid="button-edit-profile">
                    <Edit className="mr-2 w-4 h-4" />
                    프로필 편집 (준비 중)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleStudentLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    로그아웃
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Overview */}
            <Card data-testid="card-status">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 w-5 h-5" />
                  계정 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      user.role === "VERIFIED" || user.role === "ADMIN" 
                        ? "bg-green-100 dark:bg-green-900" 
                        : "bg-amber-100 dark:bg-amber-900"
                    }`}>
                      {user.role === "VERIFIED" || user.role === "ADMIN" ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">승인 상태</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.role === "VERIFIED" || user.role === "ADMIN" ? "승인 완료" : "승인 대기"}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-foreground">강의 접근</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.role === "VERIFIED" || user.role === "ADMIN" ? "전체 이용 가능" : "제한됨"}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-foreground">회원 등급</h3>
                    <p className="text-sm text-muted-foreground">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                </div>

                {user.role === "PENDING" && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      승인 처리 중
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      관리자가 회원님의 가입 신청을 검토하고 있습니다. 
                      승인이 완료되면 모든 강의를 수강하실 수 있습니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval History */}
            <Card data-testid="card-approval-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 w-5 h-5" />
                  승인 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvals.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">아직 승인 기록이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvals.map((approval) => (
                      <div 
                        key={approval.id} 
                        className="flex items-start space-x-4 p-4 rounded-lg border border-border"
                        data-testid={`approval-${approval.id}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          approval.status === "APPROVED" 
                            ? "bg-green-100 dark:bg-green-900" 
                            : "bg-red-100 dark:bg-red-900"
                        }`}>
                          {approval.status === "APPROVED" ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Badge 
                              variant="secondary"
                              className={approval.status === "APPROVED" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }
                            >
                              {approval.status === "APPROVED" ? "승인" : "거절"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(approval.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {approval.memo && (
                            <p className="text-sm text-muted-foreground">
                              메모: {approval.memo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>빠른 메뉴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-courses">
                    <a href="/courses">
                      <div className="text-left">
                        <div className="font-semibold">강의 둘러보기</div>
                        <div className="text-sm text-muted-foreground">
                          {user.role === "VERIFIED" || user.role === "ADMIN" 
                            ? "모든 강의 수강 가능" 
                            : "강의 목록 확인"
                          }
                        </div>
                      </div>
                    </a>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-about">
                    <a href="/about">
                      <div className="text-left">
                        <div className="font-semibold">원장 소개</div>
                        <div className="text-sm text-muted-foreground">
                          시대영재 학원 원장 프로필
                        </div>
                      </div>
                    </a>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-gallery">
                    <a href="/gallery">
                      <div className="text-left">
                        <div className="font-semibold">학원 갤러리</div>
                        <div className="text-sm text-muted-foreground">
                          수업 현장과 시설 둘러보기
                        </div>
                      </div>
                    </a>
                  </Button>

                  {user.role === "ADMIN" && (
                    <Button variant="outline" className="h-auto p-4 justify-start" asChild data-testid="button-admin">
                      <a href="/admin">
                        <div className="text-left">
                          <div className="font-semibold">관리자 대시보드</div>
                          <div className="text-sm text-muted-foreground">
                            회원 및 강의 관리
                          </div>
                        </div>
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
