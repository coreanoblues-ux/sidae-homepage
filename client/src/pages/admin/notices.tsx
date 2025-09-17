import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Clock,
  Eye,
  EyeOff,
  Save,
  X,
  MessageSquare,
  Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Notice {
  id: string;
  title: string;
  body: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

const noticeFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  body: z.string().min(1, "내용을 입력해주세요"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

type NoticeFormData = z.infer<typeof noticeFormSchema>;

export default function AdminNotices() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "UPCOMING" | "EXPIRED">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: "",
      body: "",
      startsAt: "",
      endsAt: "",
    },
  });

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

  const { data: notices = [], isLoading: noticesLoading, error: noticesError } = useQuery<Notice[]>({
    queryKey: ["/api/admin/notices"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // Handle notices query errors
  useEffect(() => {
    if (noticesError && isUnauthorizedError(noticesError as Error)) {
      toast({
        title: "인증이 필요합니다",
        description: "다시 로그인해주세요.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [noticesError, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: NoticeFormData) => {
      const payload = {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
      };
      await apiRequest("POST", "/api/admin/notices", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notices"] });
      toast({
        title: "공지사항 생성 완료",
        description: "새로운 공지사항이 성공적으로 생성되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "생성 실패",
        description: "공지사항 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NoticeFormData }) => {
      const payload = {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
      };
      await apiRequest("PUT", `/api/admin/notices/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notices"] });
      toast({
        title: "공지사항 수정 완료",
        description: "공지사항이 성공적으로 수정되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "수정 실패",
        description: "공지사항 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/notices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notices"] });
      toast({
        title: "공지사항 삭제 완료",
        description: "공지사항이 성공적으로 삭제되었습니다.",
      });
      setDeleteDialogOpen(false);
      setDeletingNotice(null);
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: "공지사항 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const openCreateDialog = () => {
    setEditingNotice(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEditDialog = (notice: Notice) => {
    setEditingNotice(notice);
    form.reset({
      title: notice.title,
      body: notice.body,
      startsAt: notice.startsAt ? new Date(notice.startsAt).toISOString().slice(0, 16) : "",
      endsAt: notice.endsAt ? new Date(notice.endsAt).toISOString().slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingNotice(null);
    form.reset();
  };

  const openDeleteDialog = (notice: Notice) => {
    setDeletingNotice(notice);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data: NoticeFormData) => {
    if (editingNotice) {
      updateMutation.mutate({ id: editingNotice.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getNoticeStatus = (notice: Notice) => {
    const now = new Date();
    const start = notice.startsAt ? new Date(notice.startsAt) : null;
    const end = notice.endsAt ? new Date(notice.endsAt) : null;

    if (start && now < start) {
      return {
        status: "upcoming",
        label: `공개 예정 ${start.toLocaleDateString()}`,
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        icon: <Clock className="w-3 h-3 mr-1" />,
      };
    }

    if (end && now > end) {
      return {
        status: "expired",
        label: "게시 기간 만료",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: <EyeOff className="w-3 h-3 mr-1" />,
      };
    }

    if (start && end) {
      return {
        status: "active",
        label: `게시 중 ~${end.toLocaleDateString()}`,
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: <Eye className="w-3 h-3 mr-1" />,
      };
    }

    return {
      status: "active",
      label: "게시 중",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: <Eye className="w-3 h-3 mr-1" />,
    };
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const status = getNoticeStatus(notice).status;
    if (statusFilter === "ALL") return true;
    return statusFilter.toLowerCase() === status;
  });

  const getStatusCounts = () => {
    const counts = { active: 0, upcoming: 0, expired: 0 };
    notices.forEach(notice => {
      const status = getNoticeStatus(notice).status;
      counts[status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

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
            <h1 className="text-4xl font-bold text-foreground mb-4">공지사항 관리</h1>
            <p className="text-xl text-muted-foreground">
              홈페이지에 표시될 공지사항을 작성하고 게시 기간을 설정할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Actions Bar */}
        <Card className="mb-8" data-testid="card-actions">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="제목 또는 내용으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">모든 상태</SelectItem>
                    <SelectItem value="ACTIVE">게시 중</SelectItem>
                    <SelectItem value="UPCOMING">게시 예정</SelectItem>
                    <SelectItem value="EXPIRED">게시 만료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={openCreateDialog} data-testid="button-create">
                <Plus className="mr-2 w-4 h-4" />
                공지사항 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-stat-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">전체 공지</p>
                  <p className="text-3xl font-bold text-foreground">{notices.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-active">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">게시 중</p>
                  <p className="text-3xl font-bold text-foreground">{statusCounts.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-upcoming">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">게시 예정</p>
                  <p className="text-3xl font-bold text-foreground">{statusCounts.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-expired">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">게시 만료</p>
                  <p className="text-3xl font-bold text-foreground">{statusCounts.expired}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notices List */}
        <Card data-testid="card-notices-list">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 w-5 h-5" />
              공지사항 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {noticesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-4 p-4 rounded-lg border border-border">
                      <div className="flex-1">
                        <div className="bg-muted h-4 rounded w-64 mb-2"></div>
                        <div className="bg-muted h-3 rounded w-32 mb-2"></div>
                        <div className="bg-muted h-3 rounded w-96"></div>
                      </div>
                      <div className="bg-muted h-8 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || statusFilter !== "ALL" 
                    ? "검색 결과가 없습니다" 
                    : "등록된 공지사항이 없습니다"
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "ALL"
                    ? "다른 조건으로 검색해보세요."
                    : "첫 번째 공지사항을 추가해보세요."
                  }
                </p>
                {(!searchTerm && statusFilter === "ALL") && (
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 w-4 h-4" />
                    공지사항 추가하기
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotices.map((notice) => {
                  const status = getNoticeStatus(notice);
                  
                  return (
                    <div 
                      key={notice.id} 
                      className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      data-testid={`notice-${notice.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{notice.title}</h3>
                          <Badge className={`${status.color} flex items-center ml-4`} variant="secondary">
                            {status.icon}
                            {status.label}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {notice.body}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            작성: {new Date(notice.createdAt).toLocaleString()}
                          </span>
                          {notice.startsAt && (
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              시작: {new Date(notice.startsAt).toLocaleString()}
                            </span>
                          )}
                          {notice.endsAt && (
                            <span className="flex items-center">
                              <EyeOff className="w-3 h-3 mr-1" />
                              종료: {new Date(notice.endsAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(notice)}
                          data-testid={`button-edit-${notice.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          편집
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(notice)}
                          data-testid={`button-delete-${notice.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-notice-form">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="mr-2 w-5 h-5" />
              {editingNotice ? "공지사항 편집" : "새 공지사항 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingNotice ? "공지사항 정보를 수정하세요." : "새로운 공지사항을 작성하세요."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목 *</FormLabel>
                    <FormControl>
                      <Input placeholder="공지사항 제목을 입력하세요" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용 *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="공지사항 내용을 입력하세요" 
                        rows={8}
                        {...field} 
                        data-testid="textarea-body"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>게시 시작 시간</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-starts-at"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>게시 종료 시간</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-ends-at"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">게시 기간 안내</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 게시 시작/종료 시간을 모두 비워두면 즉시 게시되어 계속 표시됩니다</li>
                  <li>• 시작 시간만 설정하면 해당 시간부터 계속 표시됩니다</li>
                  <li>• 종료 시간만 설정하면 즉시 게시되어 해당 시간까지 표시됩니다</li>
                  <li>• 시작/종료 시간을 모두 설정하면 해당 기간 동안만 표시됩니다</li>
                </ul>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} data-testid="button-cancel">
                  <X className="mr-2 w-4 h-4" />
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  <Save className="mr-2 w-4 h-4" />
                  {createMutation.isPending || updateMutation.isPending 
                    ? "저장 중..." 
                    : editingNotice ? "수정하기" : "게시하기"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <Trash2 className="mr-2 w-5 h-5" />
              공지사항 삭제
            </DialogTitle>
            <DialogDescription>
              {deletingNotice && (
                <>
                  <strong>{deletingNotice.title}</strong> 공지사항을 정말 삭제하시겠습니까?
                  <br />이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              data-testid="button-cancel-delete"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingNotice && deleteMutation.mutate(deletingNotice.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              <Trash2 className="mr-2 w-4 h-4" />
              {deleteMutation.isPending ? "삭제 중..." : "삭제하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
