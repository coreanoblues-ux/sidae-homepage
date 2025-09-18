import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Upload, 
  Plus, 
  User, 
  ImageIcon, 
  Video,
  LogOut
} from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  isVisible: boolean;
}

interface VideoLink {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
}

export default function SimpleAdmin() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState({ title: "", description: "", imageUrl: "" });
  const [newVideo, setNewVideo] = useState({ title: "", videoUrl: "", description: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 대기 회원 로드
      const usersRes = await fetch('/api/simple/pending-users', { credentials: 'include' });
      if (usersRes.ok) {
        const users = await usersRes.json();
        setPendingUsers(users);
      }

      // 갤러리 로드
      const galleryRes = await fetch('/api/simple/gallery', { credentials: 'include' });
      if (galleryRes.ok) {
        const images = await galleryRes.json();
        setGalleryImages(images);
      }

      // 동영상 링크 로드
      const videosRes = await fetch('/api/simple/videos', { credentials: 'include' });
      if (videosRes.ok) {
        const videos = await videosRes.json();
        setVideoLinks(videos);
      }

    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const res = await fetch('/api/simple/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, memo: '관리자 승인' })
      });

      if (res.ok) {
        toast({
          title: "승인 완료",
          description: "회원이 성공적으로 승인되었습니다.",
        });
        loadData();
      } else {
        throw new Error('승인 실패');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "회원 승인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const res = await fetch('/api/simple/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, memo: '관리자 거부' })
      });

      if (res.ok) {
        toast({
          title: "거부 완료",
          description: "회원 신청이 거부되었습니다.",
        });
        loadData();
      } else {
        throw new Error('거부 실패');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "회원 거부 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const addImage = async () => {
    if (!newImage.title || !newImage.imageUrl) return;

    try {
      const res = await fetch('/api/simple/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newImage)
      });

      if (res.ok) {
        toast({
          title: "이미지 추가 완료",
          description: "갤러리에 이미지가 추가되었습니다.",
        });
        setNewImage({ title: "", description: "", imageUrl: "" });
        loadData();
      } else {
        throw new Error('이미지 추가 실패');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "이미지 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const addVideo = async () => {
    if (!newVideo.title || !newVideo.videoUrl) return;

    try {
      const res = await fetch('/api/simple/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newVideo)
      });

      if (res.ok) {
        toast({
          title: "동영상 추가 완료",
          description: "동영상 링크가 추가되었습니다.",
        });
        setNewVideo({ title: "", videoUrl: "", description: "" });
        loadData();
      } else {
        throw new Error('동영상 추가 실패');
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "동영상 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/dev/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/';
    } catch (error) {
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">시대영재 학원 관리자</h1>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <User className="w-4 h-4 mr-2" />
              회원 관리 ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <ImageIcon className="w-4 h-4 mr-2" />
              갤러리 관리 ({galleryImages.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-4 h-4 mr-2" />
              동영상 관리 ({videoLinks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>가입 승인 대기 회원</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">대기 중인 회원이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveUser(user.id)} data-testid={`approve-${user.id}`}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectUser(user.id)} data-testid={`reject-${user.id}`}>
                            <XCircle className="w-4 h-4 mr-1" />
                            거부
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>새 이미지 추가</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="imageTitle">제목</Label>
                      <Input
                        id="imageTitle"
                        value={newImage.title}
                        onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="이미지 제목"
                        data-testid="input-image-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">이미지 URL</Label>
                      <Input
                        id="imageUrl"
                        value={newImage.imageUrl}
                        onChange={(e) => setNewImage(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        data-testid="input-image-url"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="imageDescription">설명</Label>
                    <Textarea
                      id="imageDescription"
                      value={newImage.description}
                      onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="이미지 설명"
                      data-testid="textarea-image-description"
                    />
                  </div>
                  <Button onClick={addImage} data-testid="button-add-image">
                    <Plus className="w-4 h-4 mr-2" />
                    이미지 추가
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>갤러리 이미지 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  {galleryImages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">등록된 이미지가 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {galleryImages.map((image) => (
                        <div key={image.id} className="border rounded-lg overflow-hidden">
                          <img 
                            src={image.imageUrl} 
                            alt={image.title}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-sm">{image.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{image.description}</p>
                            <Badge variant={image.isVisible ? "default" : "secondary"} className="mt-2">
                              {image.isVisible ? "표시됨" : "숨김"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>새 동영상 링크 추가</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="videoTitle">제목</Label>
                      <Input
                        id="videoTitle"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="동영상 제목"
                        data-testid="input-video-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="videoUrl">동영상 URL</Label>
                      <Input
                        id="videoUrl"
                        value={newVideo.videoUrl}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://example.com/video.mp4"
                        data-testid="input-video-url"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="videoDescription">설명</Label>
                    <Textarea
                      id="videoDescription"
                      value={newVideo.description}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="동영상 설명"
                      data-testid="textarea-video-description"
                    />
                  </div>
                  <Button onClick={addVideo} data-testid="button-add-video">
                    <Plus className="w-4 h-4 mr-2" />
                    동영상 추가
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>등록된 동영상 링크</CardTitle>
                </CardHeader>
                <CardContent>
                  {videoLinks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">등록된 동영상이 없습니다.</p>
                  ) : (
                    <div className="space-y-4">
                      {videoLinks.map((video) => (
                        <div key={video.id} className="border rounded-lg p-4">
                          <h4 className="font-semibold">{video.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                          <a 
                            href={video.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                          >
                            {video.videoUrl}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}