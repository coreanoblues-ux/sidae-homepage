import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Trash2, Plus, Check, X } from "lucide-react";
import { useLocation } from "wouter";

const SUPERADMIN_PATH = "/_superadmin";

export default function SuperAdmin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // 현재 인증 상태 확인 (401 에러를 throw하지 않도록 직접 fetch)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/user', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          if (userData.role === 'ADMIN') {
            setIsAuthed(true);
          }
        }
      } catch (error) {
        // 에러 무시
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);
  
  // 개발용 로그인 처리
  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const response = await apiRequest<any>('/api/dev/login', {
        method: 'POST',
        body: { password }
      });
      
      toast({ title: "로그인 성공", description: "관리자 페이지에 접속했습니다." });
      
      setPassword("");
      setIsAuthed(true);
      
      // 사용자 정보 새로고침
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    } catch (error) {
      toast({ 
        title: "로그인 실패", 
        description: "비밀번호가 잘못되었습니다.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // 권한 확인 로직 제거 - 비밀번호 입력으로 직접 접근 허용

  // 승인 대기 회원 목록
  const { data: pendingUsers = [], refetch: refetchPendingUsers } = useQuery({
    queryKey: ['/api/superadmin/pending-users'],
    enabled: isAuthed,
  });

  // 🎯 승인된 회원 목록
  const { data: verifiedUsers = [], refetch: refetchVerifiedUsers } = useQuery({
    queryKey: ['/api/superadmin/verified-users'],
    enabled: isAuthed,
  });

  // 갤러리 이미지 목록 (관리자용 - 모든 이미지)
  const { data: galleryImages = [], refetch: refetchGallery } = useQuery({
    queryKey: ['/api/superadmin/gallery'],
    enabled: isAuthed,
  });

  // 프로그램 목록 (관리자용 - 모든 프로그램)
  const { data: programs = [], refetch: refetchPrograms } = useQuery({
    queryKey: ['/api/superadmin/programs'],
    enabled: isAuthed,
  });

  // 코스 목록 (동영상 추가용)
  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    enabled: isAuthed,
  });

  // 회원 승인
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest<any>('/api/superadmin/approve-user', { method: 'POST', body: { userId } });
    },
    onSuccess: () => {
      toast({ title: "승인 완료", description: "회원이 성공적으로 승인되었습니다." });
      refetchPendingUsers();
    },
    onError: () => {
      toast({ title: "오류", description: "승인 처리 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 회원 거절
  const rejectMutation = useMutation({
    mutationFn: async ({ userId, memo }: { userId: string; memo?: string }) => {
      return await apiRequest<any>('/api/superadmin/reject-user', { method: 'POST', body: { userId, memo } });
    },
    onSuccess: () => {
      toast({ title: "거절 완료", description: "회원 신청이 거절되었습니다." });
      refetchPendingUsers();
    },
    onError: () => {
      toast({ title: "오류", description: "거절 처리 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 🎯 회원 승인 취소
  const revokeMutation = useMutation({
    mutationFn: async ({ userId, memo }: { userId: string; memo?: string }) => {
      return await apiRequest<any>('/api/superadmin/revoke-user', { method: 'POST', body: { userId, memo } });
    },
    onSuccess: () => {
      toast({ title: "승인 취소", description: "회원 승인이 취소되었습니다." });
      refetchVerifiedUsers();
      refetchPendingUsers(); // 대기자 목록도 새로고침 (취소된 회원이 다시 대기자가 됨)
    },
    onError: () => {
      toast({ title: "오류", description: "승인 취소 처리 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 갤러리 이미지 추가
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");

  const addImageMutation = useMutation({
    mutationFn: async (imageData: { url: string; caption?: string }) => {
      return await apiRequest<any>('/api/superadmin/gallery', { method: 'POST', body: imageData });
    },
    onSuccess: () => {
      toast({ title: "추가 완료", description: "갤러리 이미지가 추가되었습니다." });
      setNewImageUrl("");
      setNewImageCaption("");
      refetchGallery();
    },
    onError: () => {
      toast({ title: "오류", description: "이미지 추가 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 갤러리 이미지 삭제
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return await apiRequest<any>(`/api/superadmin/gallery/${imageId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({ title: "삭제 완료", description: "갤러리 이미지가 삭제되었습니다." });
      refetchGallery();
    },
    onError: () => {
      toast({ title: "오류", description: "이미지 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 갤러리 이미지 가시성 토글
  const toggleImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return await apiRequest<any>(`/api/superadmin/gallery/${imageId}/toggle`, { method: 'POST' });
    },
    onSuccess: () => {
      toast({ title: "변경 완료", description: "이미지 가시성이 변경되었습니다." });
      refetchGallery();
    },
    onError: () => {
      toast({ title: "오류", description: "가시성 변경 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 동영상 링크 추가 상태
  const [videoData, setVideoData] = useState({
    courseId: "",
    title: "",
    externalUrl: "",
    isPublished: "true",
    accessStart: "",
    accessEnd: "",
  });

  // 프로그램 추가/편집 상태
  const [programData, setProgramData] = useState({
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    content: "",
    features: [] as string[],
    targetStudents: "",
    curriculum: "",
    isActive: true,
    order: 0,
  });

  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState("");

  const addVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest<any>('/api/admin/videos', {
        method: 'POST',
        body: {
          ...data,
          isPublished: data.isPublished === "true",
          accessStart: data.accessStart ? new Date(data.accessStart).toISOString() : undefined,
          accessEnd: data.accessEnd ? new Date(data.accessEnd).toISOString() : undefined,
        }
      });
    },
    onSuccess: () => {
      toast({ title: "추가 완료", description: "동영상 링크가 추가되었습니다." });
      setVideoData({
        courseId: "",
        title: "",
        externalUrl: "",
        isPublished: "true",
        accessStart: "",
        accessEnd: "",
      });
    },
    onError: () => {
      toast({ title: "오류", description: "동영상 추가 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 프로그램 생성/업데이트
  const saveProgramMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingProgramId) {
        return await apiRequest<any>(`/api/superadmin/programs/${editingProgramId}`, {
          method: 'PUT',
          body: data
        });
      } else {
        return await apiRequest<any>('/api/superadmin/programs', {
          method: 'POST',
          body: data
        });
      }
    },
    onSuccess: (program) => {
      toast({ 
        title: editingProgramId ? "수정 완료" : "추가 완료", 
        description: editingProgramId ? "프로그램이 수정되었습니다." : "프로그램이 추가되었습니다." 
      });
      resetProgramForm();
      refetchPrograms();
      
      // Invalidate public program caches
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      if (program?.slug) {
        queryClient.invalidateQueries({ queryKey: ['/api/programs', program.slug] });
      }
    },
    onError: () => {
      toast({ 
        title: "오류", 
        description: "프로그램 저장 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    },
  });

  // 프로그램 삭제
  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: string) => {
      // Get program info before deletion for cache invalidation
      const programToDelete = programs.find((p: any) => p.id === programId);
      return { programToDelete, result: await apiRequest<any>(`/api/superadmin/programs/${programId}`, { method: 'DELETE' }) };
    },
    onSuccess: (data) => {
      toast({ title: "삭제 완료", description: "프로그램이 삭제되었습니다." });
      refetchPrograms();
      
      // Invalidate public program caches
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      if (data?.programToDelete?.slug) {
        queryClient.invalidateQueries({ queryKey: ['/api/programs', data.programToDelete.slug] });
      }
    },
    onError: () => {
      toast({ title: "오류", description: "프로그램 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    },
  });

  // 프로그램 폼 리셋
  const resetProgramForm = () => {
    setProgramData({
      slug: "",
      title: "",
      subtitle: "",
      description: "",
      content: "",
      features: [],
      targetStudents: "",
      curriculum: "",
      isActive: true,
      order: 0,
    });
    setEditingProgramId(null);
    setNewFeature("");
  };

  // 프로그램 편집 시작
  const startEditingProgram = (program: any) => {
    setProgramData({
      slug: program.slug || "",
      title: program.title || "",
      subtitle: program.subtitle || "",
      description: program.description || "",
      content: program.content || "",
      features: program.features || [],
      targetStudents: program.targetStudents || "",
      curriculum: program.curriculum || "",
      isActive: program.isActive ?? true,
      order: program.order || 0,
    });
    setEditingProgramId(program.id);
  };

  // 특징 추가
  const addFeature = () => {
    if (newFeature.trim()) {
      setProgramData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  // 특징 제거
  const removeFeature = (index: number) => {
    setProgramData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 로그인하지 않은 경우 비밀번호 프롬프트 표시
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              🔐 Super Admin
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              비밀 관리자 페이지 접근
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDevLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" data-testid="label-password">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="관리자 비밀번호를 입력하세요"
                  disabled={isLoggingIn}
                  data-testid="input-password"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                type="submit"
                disabled={!password || isLoggingIn}
                className="w-full"
                data-testid="button-login"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "접속하기"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Super Admin · Secret</h1>
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          비밀 관리자 페이지
        </Badge>
      </div>

      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="approvals">가입 승인</TabsTrigger>
          <TabsTrigger value="members">회원 관리</TabsTrigger>
          <TabsTrigger value="gallery">갤러리 관리</TabsTrigger>
          <TabsTrigger value="programs">프로그램 관리</TabsTrigger>
          <TabsTrigger value="videos">동영상 링크</TabsTrigger>
        </TabsList>

        {/* 가입 승인 관리 */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>가입 승인 대기</CardTitle>
            </CardHeader>
            <CardContent>
              {(pendingUsers as any[]).length === 0 ? (
                <p className="text-muted-foreground">대기 중인 회원이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {(pendingUsers as any[]).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(user.id)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-${user.id}`}
                        >
                          {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate({ userId: user.id })}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-${user.id}`}
                        >
                          {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          거절
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🎯 승인된 회원 관리 */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>승인된 회원 관리</CardTitle>
              <p className="text-sm text-muted-foreground">
                현재 승인된 회원들의 목록입니다. 필요시 승인을 취소할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              {(verifiedUsers as any[]).length === 0 ? (
                <p className="text-muted-foreground">승인된 회원이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {(verifiedUsers as any[]).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.email}</p>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            ✓ 승인됨
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          승인일: {new Date(user.updatedAt || user.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`${user.email} 회원의 승인을 취소하시겠습니까?\n승인 취소 시 해당 회원은 다시 대기 상태가 됩니다.`)) {
                              revokeMutation.mutate({ userId: user.id, memo: '관리자 승인 취소' });
                            }
                          }}
                          disabled={revokeMutation.isPending}
                          data-testid={`button-revoke-${user.id}`}
                        >
                          {revokeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          승인 취소
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(verifiedUsers as any[]).length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>승인 취소 안내:</strong> 승인을 취소한 회원은 다시 "가입 승인" 탭의 대기 목록으로 이동됩니다. 
                    필요시 재승인이 가능합니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 갤러리 관리 */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>새 이미지 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="imageUrl">이미지 URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    data-testid="input-image-url"
                  />
                </div>
                <div>
                  <Label htmlFor="imageCaption">캡션 (선택)</Label>
                  <Input
                    id="imageCaption"
                    placeholder="예: 정우석 원장 수업 현장"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    data-testid="input-image-caption"
                  />
                </div>
              </div>
              <Button
                onClick={() => addImageMutation.mutate({ url: newImageUrl, caption: newImageCaption || undefined })}
                disabled={!newImageUrl || addImageMutation.isPending}
                data-testid="button-add-image"
              >
                {addImageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                이미지 추가
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(galleryImages as any[]).map((image: any) => (
              <Card key={image.id}>
                <CardContent className="p-4 space-y-4">
                  <img 
                    src={image.url} 
                    alt={image.caption || 'gallery'} 
                    className="w-full h-48 object-cover rounded"
                    data-testid={`img-gallery-${image.id}`}
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground" data-testid={`text-caption-${image.id}`}>
                      {image.caption || '캡션 없음'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleImageMutation.mutate(image.id)}
                        disabled={toggleImageMutation.isPending}
                        data-testid={`button-toggle-${image.id}`}
                      >
                        {image.visible ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                        {image.visible ? '숨기기' : '보이기'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImageMutation.mutate(image.id)}
                        disabled={deleteImageMutation.isPending}
                        data-testid={`button-delete-${image.id}`}
                      >
                        {deleteImageMutation.isPending ? <Loader2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(galleryImages as any[]).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">등록된 이미지가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 프로그램 관리 */}
        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingProgramId ? '프로그램 수정' : '새 프로그램 추가'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="programSlug">슬러그 (URL용)</Label>
                  <Input
                    id="programSlug"
                    placeholder="middle-school"
                    value={programData.slug}
                    onChange={(e) => setProgramData(prev => ({ ...prev, slug: e.target.value }))}
                    data-testid="input-program-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="programOrder">순서</Label>
                  <Input
                    id="programOrder"
                    type="number"
                    value={programData.order}
                    onChange={(e) => setProgramData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    data-testid="input-program-order"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="programTitle">프로그램 제목</Label>
                  <Input
                    id="programTitle"
                    placeholder="중학교 영어 내신 프로그램"
                    value={programData.title}
                    onChange={(e) => setProgramData(prev => ({ ...prev, title: e.target.value }))}
                    data-testid="input-program-title"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="programSubtitle">부제목</Label>
                  <Input
                    id="programSubtitle"
                    placeholder="체계적인 내신 관리와 실력 향상"
                    value={programData.subtitle}
                    onChange={(e) => setProgramData(prev => ({ ...prev, subtitle: e.target.value }))}
                    data-testid="input-program-subtitle"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="programDescription">간단 설명</Label>
                  <Textarea
                    id="programDescription"
                    placeholder="프로그램에 대한 간단한 설명을 입력하세요."
                    value={programData.description}
                    onChange={(e) => setProgramData(prev => ({ ...prev, description: e.target.value }))}
                    data-testid="textarea-program-description"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="programContent">상세 내용 (HTML 가능)</Label>
                  <Textarea
                    id="programContent"
                    placeholder="프로그램의 상세 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
                    value={programData.content}
                    onChange={(e) => setProgramData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-32"
                    data-testid="textarea-program-content"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="programTargetStudents">대상 학생</Label>
                  <Input
                    id="programTargetStudents"
                    placeholder="중학교 1-3학년"
                    value={programData.targetStudents}
                    onChange={(e) => setProgramData(prev => ({ ...prev, targetStudents: e.target.value }))}
                    data-testid="input-program-target-students"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="programCurriculum">커리큘럼 (HTML 가능)</Label>
                  <Textarea
                    id="programCurriculum"
                    placeholder="커리큘럼 정보를 입력하세요."
                    value={programData.curriculum}
                    onChange={(e) => setProgramData(prev => ({ ...prev, curriculum: e.target.value }))}
                    className="min-h-24"
                    data-testid="textarea-program-curriculum"
                  />
                </div>
                <div>
                  <Label htmlFor="programActive">활성 상태</Label>
                  <Select 
                    value={programData.isActive ? "true" : "false"} 
                    onValueChange={(value) => setProgramData(prev => ({ ...prev, isActive: value === "true" }))}
                  >
                    <SelectTrigger data-testid="select-program-active">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">활성</SelectItem>
                      <SelectItem value="false">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 주요 특징 관리 */}
              <div className="space-y-3">
                <Label>주요 특징</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="특징을 입력하세요"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    data-testid="input-new-feature"
                  />
                  <Button type="button" onClick={addFeature} disabled={!newFeature.trim()} data-testid="button-add-feature">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {programData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1" data-testid={`badge-feature-${index}`}>
                      {feature}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFeature(index)}
                        data-testid={`button-remove-feature-${index}`}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveProgramMutation.mutate(programData)}
                  disabled={!programData.slug || !programData.title || !programData.content || saveProgramMutation.isPending}
                  data-testid="button-save-program"
                >
                  {saveProgramMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingProgramId ? '수정' : '추가'}
                </Button>
                {editingProgramId && (
                  <Button
                    variant="outline"
                    onClick={resetProgramForm}
                    data-testid="button-cancel-edit"
                  >
                    취소
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {(programs as any[]).map((program: any) => (
              <Card key={program.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold" data-testid={`text-program-title-${program.id}`}>
                          {program.title}
                        </h3>
                        <Badge variant={program.isActive ? "default" : "secondary"} data-testid={`badge-program-status-${program.id}`}>
                          {program.isActive ? '활성' : '비활성'}
                        </Badge>
                        <Badge variant="outline" data-testid={`badge-program-order-${program.id}`}>
                          순서: {program.order}
                        </Badge>
                      </div>
                      {program.subtitle && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-program-subtitle-${program.id}`}>
                          {program.subtitle}
                        </p>
                      )}
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid={`text-program-slug-${program.id}`}>
                        /program/{program.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditingProgram(program)}
                        data-testid={`button-edit-program-${program.id}`}
                      >
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProgramMutation.mutate(program.id)}
                        disabled={deleteProgramMutation.isPending}
                        data-testid={`button-delete-program-${program.id}`}
                      >
                        {deleteProgramMutation.isPending ? <Loader2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {program.description && (
                    <p className="text-sm text-muted-foreground mb-3" data-testid={`text-program-description-${program.id}`}>
                      {program.description}
                    </p>
                  )}
                  
                  {program.features && program.features.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">주요 특징:</p>
                      <div className="flex flex-wrap gap-1">
                        {program.features.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs" data-testid={`badge-program-feature-${program.id}-${index}`}>
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {program.targetStudents && (
                    <p className="text-sm" data-testid={`text-program-target-${program.id}`}>
                      <span className="font-medium">대상:</span> {program.targetStudents}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(programs as any[]).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">등록된 프로그램이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 동영상 링크 관리 */}
        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>동영상 링크 등록</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseSelect">코스</Label>
                  <Select 
                    value={videoData.courseId} 
                    onValueChange={(value) => setVideoData(prev => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder="코스 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {(courses as any[]).map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="videoTitle">제목</Label>
                  <Input
                    id="videoTitle"
                    value={videoData.title}
                    onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                    data-testid="input-video-title"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="videoUrl">외부 링크 (NAS 등)</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://..."
                    value={videoData.externalUrl}
                    onChange={(e) => setVideoData(prev => ({ ...prev, externalUrl: e.target.value }))}
                    data-testid="input-video-url"
                  />
                </div>
                <div>
                  <Label htmlFor="videoPublished">공개 여부</Label>
                  <Select 
                    value={videoData.isPublished} 
                    onValueChange={(value) => setVideoData(prev => ({ ...prev, isPublished: value }))}
                  >
                    <SelectTrigger data-testid="select-video-published">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">공개</SelectItem>
                      <SelectItem value="false">비공개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accessStart">접근 시작 (선택)</Label>
                  <Input
                    id="accessStart"
                    type="datetime-local"
                    value={videoData.accessStart}
                    onChange={(e) => setVideoData(prev => ({ ...prev, accessStart: e.target.value }))}
                    data-testid="input-access-start"
                  />
                </div>
                <div>
                  <Label htmlFor="accessEnd">접근 종료 (선택)</Label>
                  <Input
                    id="accessEnd"
                    type="datetime-local"
                    value={videoData.accessEnd}
                    onChange={(e) => setVideoData(prev => ({ ...prev, accessEnd: e.target.value }))}
                    data-testid="input-access-end"
                  />
                </div>
              </div>
              <Button
                onClick={() => addVideoMutation.mutate(videoData)}
                disabled={!videoData.courseId || !videoData.title || !videoData.externalUrl || addVideoMutation.isPending}
                data-testid="button-add-video"
              >
                {addVideoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                링크 추가
              </Button>
              <p className="text-xs text-muted-foreground">
                * 접근 제어는 Video의 accessStart/accessEnd 및 isPublished, 그리고 사용자 역할(VERIFIED/ADMIN)에 의해 결정됩니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}