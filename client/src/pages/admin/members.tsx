import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Calendar,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: "PENDING" | "VERIFIED" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export default function AdminMembers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "ADMIN">("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [memo, setMemo] = useState("");

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

  const { data: pendingUsers = [], isLoading: usersLoading, error: pendingUsersError } = useQuery<User[]>({
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

  const approveMutation = useMutation({
    mutationFn: async ({ userId, memo }: { userId: string; memo?: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/approve`, { memo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      toast({
        title: "회원 승인 완료",
        description: "회원이 성공적으로 승인되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "인증이 필요합니다",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "승인 실패",
        description: "회원 승인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, memo }: { userId: string; memo?: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/reject`, { memo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      toast({
        title: "회원 거절 완료",
        description: "회원 신청이 거절되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "인증이 필요합니다",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "거절 실패",
        description: "회원 거절 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const openApprovalDialog = (user: User, type: "approve" | "reject") => {
    setSelectedUser(user);
    setActionType(type);
    setMemo("");
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setActionType(null);
    setMemo("");
  };

  const handleAction = () => {
    if (!selectedUser || !actionType) return;

    if (actionType === "approve") {
      approveMutation.mutate({ userId: selectedUser.id, memo });
    } else {
      rejectMutation.mutate({ userId: selectedUser.id, memo });
    }
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
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

  if (isLoading || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="bg-muted h-8 rounded w-64 mb-4"></div>
          <div className="bg-muted h-32 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">회원 관리</h1>
            <p className="text-xl text-muted-foreground">
              가입 신청한 회원들을 승인하거나 거절할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters and Search */}
        <Card className="mb-8" data-testid="card-filters">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="이름 또는 이메일로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" data-testid="button-role-filter">
                    <Filter className="mr-2 w-4 h-4" />
                    {roleFilter === "ALL" ? "모든 상태" : getRoleLabel(roleFilter)}
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRoleFilter("ALL")}>
                    모든 상태
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("PENDING")}>
                    승인 대기
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("VERIFIED")}>
                    인증 회원
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("ADMIN")}>
                    관리자
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-stat-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">전체 대기</p>
                  <p className="text-3xl font-bold text-foreground">{pendingUsers.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-filtered">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">검색 결과</p>
                  <p className="text-3xl font-bold text-foreground">{filteredUsers.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-processing">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">처리 중</p>
                  <p className="text-3xl font-bold text-foreground">
                    {approveMutation.isPending || rejectMutation.isPending ? 1 : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card data-testid="card-members-list">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 w-5 h-5" />
              회원 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-4 rounded-lg border border-border">
                      <div className="bg-muted w-12 h-12 rounded-full"></div>
                      <div className="flex-1">
                        <div className="bg-muted h-4 rounded w-48 mb-2"></div>
                        <div className="bg-muted h-3 rounded w-32"></div>
                      </div>
                      <div className="bg-muted h-8 rounded w-20"></div>
                      <div className="bg-muted h-8 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || roleFilter !== "ALL" ? "검색 결과가 없습니다" : "승인 대기 중인 회원이 없습니다"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== "ALL" ? "다른 조건으로 검색해보세요." : "새로운 가입 신청을 기다리고 있습니다."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((pendingUser) => (
                  <div 
                    key={pendingUser.id} 
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    data-testid={`member-${pendingUser.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={pendingUser.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {pendingUser.firstName?.[0] || pendingUser.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {pendingUser.firstName || pendingUser.email}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {pendingUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(pendingUser.role)} variant="secondary">
                            {getRoleLabel(pendingUser.role)}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(pendingUser.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {pendingUser.role === "PENDING" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApprovalDialog(pendingUser, "approve")}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-approve-${pendingUser.id}`}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApprovalDialog(pendingUser, "reject")}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-reject-${pendingUser.id}`}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval/Rejection Dialog */}
      <Dialog open={!!selectedUser && !!actionType} onOpenChange={closeDialog}>
        <DialogContent data-testid="dialog-action">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {actionType === "approve" ? (
                <CheckCircle className="mr-2 w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="mr-2 w-5 h-5 text-red-600" />
              )}
              회원 {actionType === "approve" ? "승인" : "거절"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  <strong>{selectedUser.firstName || selectedUser.email}</strong>님의 가입 신청을{" "}
                  {actionType === "approve" ? "승인" : "거절"}하시겠습니까?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                메모 (선택사항)
              </label>
              <Textarea
                placeholder={`${actionType === "approve" ? "승인" : "거절"} 사유나 메모를 입력하세요...`}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                data-testid="textarea-memo"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} data-testid="button-cancel">
              취소
            </Button>
            <Button
              onClick={handleAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              variant={actionType === "approve" ? "default" : "destructive"}
              data-testid="button-confirm"
            >
              {approveMutation.isPending || rejectMutation.isPending ? (
                "처리 중..."
              ) : (
                actionType === "approve" ? "승인하기" : "거절하기"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
