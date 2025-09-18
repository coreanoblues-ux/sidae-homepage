import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

  React.useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div data-testid="video-manager" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">동영상 관리</h2>
        <Button onClick={loadVideos} disabled={loading} data-testid="button-refresh-videos">
          {loading ? '로딩중...' : '새로고침'}
        </Button>
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
                  <div>
                    <p className="font-medium" data-testid={`text-video-title-${video.id}`}>
                      {video.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      코스: {video.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      URL: {video.videoUrl}
                    </p>
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

  React.useEffect(() => {
    loadImages();
  }, []);

  return (
    <div data-testid="gallery-manager" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">갤러리 관리</h2>
        <Button onClick={loadImages} disabled={loading} data-testid="button-refresh-gallery">
          {loading ? '로딩중...' : '새로고침'}
        </Button>
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
                <img 
                  src={image.url} 
                  alt={image.caption || 'Gallery image'} 
                  className="w-full h-48 object-cover rounded"
                  data-testid={`img-gallery-${image.id}`}
                />
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

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">관리자 대시보드</h1>
            <p className="text-muted-foreground">시대영재 학원 관리자 페이지</p>
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