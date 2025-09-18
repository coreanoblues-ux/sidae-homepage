import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, LogOut } from 'lucide-react';

// 관리자 대시보드 탭 컴포넌트들
const PendingMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    try {
      console.log('🔍 쿠키 확인:', document.cookie);
      console.log('🚀 API 호출 시작: /api/admin/members?status=pending');
      
      const response = await fetch('/api/admin/members?status=pending', {
        credentials: 'include'
      });
      
      console.log('📡 응답 상태:', response.status, response.statusText);
      console.log('🍪 응답 헤더:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📄 응답 데이터:', data);
      
      if (data.ok) {
        setMembers(data.items || []);
        console.log('✅ 회원 로드 성공:', data.items?.length, '명');
      } else {
        console.error('❌ Failed to load members:', data.message);
        // 401 에러면 다시 로그인 페이지로
        if (response.status === 401) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/_superadmin';
        }
      }
    } catch (error) {
      console.error('💥 Error loading members:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, memo: '관리자 승인' })
      });
      const data = await response.json();
      if (data.ok) {
        loadMembers(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, memo: '관리자 거부' })
      });
      const data = await response.json();
      if (data.ok) {
        loadMembers(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  React.useEffect(() => {
    loadMembers();
  }, []);

  return (
    <div data-testid="pending-members" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">대기중인 회원</h2>
        <Button onClick={loadMembers} disabled={loading} data-testid="button-refresh">
          {loading ? '로딩중...' : '새로고침'}
        </Button>
      </div>
      
      {loading ? (
        <p>로딩중...</p>
      ) : members.length === 0 ? (
        <p data-testid="text-no-members">대기중인 회원이 없습니다.</p>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member.id} data-testid={`card-member-${member.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" data-testid={`text-name-${member.id}`}>
                      {member.name}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-email-${member.id}`}>
                      {member.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      가입일: {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      onClick={() => handleApprove(member.id)}
                      size="sm" 
                      data-testid={`button-approve-${member.id}`}
                    >
                      승인
                    </Button>
                    <Button 
                      onClick={() => handleReject(member.id)}
                      variant="destructive" 
                      size="sm"
                      data-testid={`button-reject-${member.id}`}
                    >
                      거부
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const VideoManager = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '', videoUrl: '' });

  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/videos', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.ok) {
        setVideos(data.items || []);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) return;

    try {
      const url = editingVideo 
        ? `/api/admin/videos/${editingVideo.id}`
        : '/api/admin/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.ok) {
        loadVideos(); // 목록 새로고침
        setDialogOpen(false);
        setEditingVideo(null);
        setFormData({ title: '', description: '', videoUrl: '' });
      }
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl
    });
    setDialogOpen(true);
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.ok) {
        loadVideos(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const openAddDialog = () => {
    setEditingVideo(null);
    setFormData({ title: '', description: '', videoUrl: '' });
    setDialogOpen(true);
  };

  React.useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div data-testid="video-manager" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">동영상 관리</h2>
        <div className="space-x-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} data-testid="button-add-video">
                <Plus className="w-4 h-4 mr-2" />
                동영상 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? '동영상 수정' : '동영상 추가'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-video-title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="input-video-description"
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">동영상 URL *</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    required
                    placeholder="https://example.com/video.mp4"
                    data-testid="input-video-url"
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" data-testid="button-save-video">
                    {editingVideo ? '수정' : '추가'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-video"
                  >
                    취소
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button onClick={loadVideos} disabled={loading} data-testid="button-refresh-videos">
            {loading ? '로딩중...' : '새로고침'}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <p>로딩중...</p>
      ) : videos.length === 0 ? (
        <p data-testid="text-no-videos">등록된 동영상이 없습니다.</p>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <Card key={video.id} data-testid={`card-video-${video.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-video-title-${video.id}`}>
                      {video.title}
                    </p>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {video.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      코스: {video.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      URL: {video.videoUrl}
                    </p>
                  </div>
                  <div className="space-x-2 ml-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(video)}
                      data-testid={`button-edit-video-${video.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(video.id)}
                      data-testid={`button-delete-video-${video.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const GalleryManager = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [formData, setFormData] = useState({ caption: '', imageUrl: '' });

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/gallery', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.ok) {
        setImages(data.items || []);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) return;

    try {
      const url = editingImage 
        ? `/api/admin/gallery/${editingImage.id}`
        : '/api/admin/gallery';
      const method = editingImage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.ok) {
        loadImages(); // 목록 새로고침
        setDialogOpen(false);
        setEditingImage(null);
        setFormData({ caption: '', imageUrl: '' });
      }
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleEdit = (image: any) => {
    setEditingImage(image);
    setFormData({
      caption: image.caption || '',
      imageUrl: image.url
    });
    setDialogOpen(true);
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/gallery/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.ok) {
        loadImages(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const openAddDialog = () => {
    setEditingImage(null);
    setFormData({ caption: '', imageUrl: '' });
    setDialogOpen(true);
  };

  React.useEffect(() => {
    loadImages();
  }, []);

  return (
    <div data-testid="gallery-manager" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">갤러리 관리</h2>
        <div className="space-x-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} data-testid="button-add-image">
                <Plus className="w-4 h-4 mr-2" />
                이미지 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingImage ? '이미지 수정' : '이미지 추가'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">이미지 URL *</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-image-url"
                  />
                </div>
                <div>
                  <Label htmlFor="caption">캡션</Label>
                  <Input
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="이미지 설명"
                    data-testid="input-image-caption"
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" data-testid="button-save-image">
                    {editingImage ? '수정' : '추가'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-image"
                  >
                    취소
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button onClick={loadImages} disabled={loading} data-testid="button-refresh-gallery">
            {loading ? '로딩중...' : '새로고침'}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <p>로딩중...</p>
      ) : images.length === 0 ? (
        <p data-testid="text-no-images">등록된 이미지가 없습니다.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} data-testid={`card-image-${image.id}`}>
              <CardContent className="pt-6">
                <div className="relative">
                  <img 
                    src={image.url} 
                    alt={image.caption || 'Gallery image'} 
                    className="w-full h-48 object-cover rounded"
                    data-testid={`img-gallery-${image.id}`}
                  />
                  <div className="absolute top-2 right-2 space-x-1">
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(image)}
                      data-testid={`button-edit-image-${image.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                      data-testid={`button-delete-image-${image.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {image.caption && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid={`text-caption-${image.id}`}>
                    {image.caption}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    
    try {
      console.log('🚪 로그아웃 시도 시작');
      
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('📡 로그아웃 응답 상태:', response.status);
      const data = await response.json();
      console.log('📄 로그아웃 응답 데이터:', data);
      
      if (response.ok) {
        console.log('✅ 로그아웃 성공! 쿠키 확인:', document.cookie);
        // 로그아웃 성공 시 로그인 페이지로 이동
        window.location.href = '/_superadmin';
      }
    } catch (error) {
      console.error('💥 Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">관리자 대시보드</h1>
              <p className="text-muted-foreground">시대영재 학원 관리자 페이지</p>
            </div>
            <Button 
              variant="outline"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
          
          <div className="border-b">
            <nav className="flex space-x-8" data-testid="nav-dashboard">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="button-tab-pending"
              >
                대기중 회원
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="button-tab-videos"
              >
                동영상 관리
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'gallery'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="button-tab-gallery"
              >
                갤러리 관리
              </button>
            </nav>
          </div>
          
          <div className="py-6">
            {activeTab === 'pending' && <PendingMembers />}
            {activeTab === 'videos' && <VideoManager />}
            {activeTab === 'gallery' && <GalleryManager />}
          </div>
        </div>
      </div>
    </div>
  );
}