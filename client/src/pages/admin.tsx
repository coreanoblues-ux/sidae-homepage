import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  X, 
  Trash2,
  Settings,
  Shield,
  Video,
  Calendar
} from "lucide-react";

interface PendingUser {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  role: string;
}

interface ApprovedUser {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface VideoUpload {
  title: string;
  description: string;
  videoUrl: string;
  courseId?: string;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("users");
  const [videoForm, setVideoForm] = useState<VideoUpload>({
    title: "",
    description: "",
    videoUrl: "",
    courseId: ""
  });

  // 대기 중인 사용자 목록 조회  
  const { data: pendingUsers, isLoading: usersLoading } = useQuery<ApprovedUser[]>({
    queryKey: ["/api/admin/members", "pending"],
    queryFn: () => fetch("/api/admin/members?status=pending").then(res => res.json()).then(data => data.items),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // 승인된 사용자 목록 조회
  const { data: approvedUsers, isLoading: approvedLoading } = useQuery<ApprovedUser[]>({
    queryKey: ["/api/admin/members", "verified"],
    queryFn: () => fetch("/api/admin/members?status=verified").then(res => res.json()).then(data => data.items),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // 갤러리 이미지 조회
  const { data: galleryImages, isLoading: galleryLoading } = useQuery<string[]>({
    queryKey: ["/api/admin/gallery"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // 사용자 승인/거부 뮤테이션
  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'approve' | 'reject' }) => {
      return await apiRequest(`/api/admin/${action}-user`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", "verified"] });
      toast({
        title: "처리 완료",
        description: "사용자 승인 요청이 처리되었습니다."
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류 발생",
        description: error.message || "처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // 사용자 승인 취소 뮤테이션
  const revokeUserMutation = useMutation({
    mutationFn: (userId: string) => 
      fetch('/api/admin/revoke-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", "verified"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", "pending"] });
      toast({
        title: "승인 취소 완료",
        description: "회원 승인이 취소되었습니다."
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류 발생",
        description: error.message || "승인 취소 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // 동영상 업로드 뮤테이션
  const uploadVideoMutation = useMutation({
    mutationFn: async (data: VideoUpload) => {
      return await apiRequest('/api/admin/videos', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      setVideoForm({ title: "", description: "", videoUrl: "", courseId: "" });
      toast({
        title: "업로드 완료",
        description: "동영상이 성공적으로 업로드되었습니다."
      });
    },
    onError: (error: any) => {
      toast({
        title: "업로드 실패",
        description: error.message || "동영상 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  // 관리자 권한 확인
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">접근 권한 없음</h2>
              <p className="text-muted-foreground mb-4">
                이 페이지는 관리자만 접근할 수 있습니다.
              </p>
              <Button asChild>
                <a href="/api/login">로그인</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUserAction = (userId: string, action: 'approve' | 'reject') => {
    approveUserMutation.mutate({ userId, action });
  };

  const handleRevokeUser = (userId: string) => {
    revokeUserMutation.mutate(userId);
  };

  const handleVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.videoUrl) {
      toast({
        title: "입력 오류",
        description: "제목과 동영상 URL은 필수입니다.",
        variant: "destructive"
      });
      return;
    }
    uploadVideoMutation.mutate(videoForm);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 실제 구현에서는 파일을 서버에 업로드하는 로직이 필요합니다
    toast({
      title: "기능 준비 중",
      description: "갤러리 업로드 기능이 곧 추가될 예정입니다.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <Settings className="inline-block mr-3 w-8 h-8" />
            관리자 대시보드
          </h1>
          <p className="text-muted-foreground">
            시대영재 학원 관리 시스템
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              대기중 회원
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              승인된 회원
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              동영상 관리
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              공지사 관리
            </TabsTrigger>
          </TabsList>

          {/* 회원 승인 관리 탭 */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  가입 승인 대기 중인 회원
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : pendingUsers && pendingUsers.length > 0 ? (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'approve')}
                            disabled={approveUserMutation.isPending}
                            data-testid={`button-approve-${user.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserAction(user.id, 'reject')}
                            disabled={approveUserMutation.isPending}
                            data-testid={`button-reject-${user.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            거부
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">승인 대기 중인 회원이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 승인된 회원 관리 탭 */}
          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  승인된 회원 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : approvedUsers && approvedUsers.length > 0 ? (
                  <div className="space-y-4">
                    {approvedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </Badge>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              승인됨
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revokeUserMutation.mutate(user.id)}
                            disabled={revokeUserMutation.isPending}
                            data-testid={`button-revoke-${user.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            취소
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Check className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">승인된 회원이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 동영상 업로드 탭 */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  강의 동영상 업로드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVideoUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="video-title">동영상 제목 *</Label>
                      <Input
                        id="video-title"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="강의 제목을 입력하세요"
                        data-testid="input-video-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-course">강의 과정</Label>
                      <Input
                        id="video-course"
                        value={videoForm.courseId}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, courseId: e.target.value }))}
                        placeholder="강의 과정 (선택사항)"
                        data-testid="input-video-course"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="video-url">동영상 URL *</Label>
                    <Input
                      id="video-url"
                      value={videoForm.videoUrl}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://example.com/video.mp4"
                      data-testid="input-video-url"
                    />
                  </div>

                  <div>
                    <Label htmlFor="video-description">강의 설명</Label>
                    <Textarea
                      id="video-description"
                      value={videoForm.description}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="강의 내용에 대한 설명을 작성하세요"
                      rows={4}
                      data-testid="textarea-video-description"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={uploadVideoMutation.isPending}
                    data-testid="button-upload-video"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadVideoMutation.isPending ? "업로드 중..." : "동영상 업로드"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 갤러리 관리 탭 */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  학원 갤러리 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="gallery-upload">새 이미지 업로드</Label>
                    <Input
                      id="gallery-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="mt-2"
                      data-testid="input-gallery-upload"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG, PNG 파일을 선택하세요. 여러 파일을 한 번에 업로드할 수 있습니다.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-4">현재 갤러리 이미지</h4>
                    {galleryLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : galleryImages && galleryImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`갤러리 이미지 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  // 실제 구현에서는 이미지 삭제 API 호출
                                  toast({
                                    title: "기능 준비 중",
                                    description: "이미지 삭제 기능이 곧 추가될 예정입니다."
                                  });
                                }}
                                data-testid={`button-delete-image-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">갤러리 이미지가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}