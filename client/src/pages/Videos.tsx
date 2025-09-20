import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Video {
  id: string;
  title: string;
  type: 'youtube' | 'nas';
  url: string;
  createdAt: string;
}

const VideoPlayer = ({ video, onClose }: { video: Video; onClose: () => void }) => {
  const renderVideo = () => {
    if (video.type === 'youtube') {
      // YouTube URL을 embed URL로 변환
      let embedUrl = video.url;
      
      // youtu.be/ 형식을 embed로 변환
      if (video.url.includes('youtu.be/')) {
        const videoId = video.url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      // youtube.com/watch?v= 형식을 embed로 변환
      else if (video.url.includes('youtube.com/watch?v=')) {
        const videoId = video.url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      // 이미 embed URL인 경우
      else if (!video.url.includes('/embed/')) {
        embedUrl = `https://www.youtube.com/embed/${video.url}`;
      }

      return (
        <div className="relative w-full aspect-video">
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-testid={`youtube-player-${video.id}`}
          />
        </div>
      );
    } else if (video.type === 'nas') {
      // NAS 동영상: HTTP는 프록시를 통해, HTTPS는 직접 로드
      const videoUrl = video.url.startsWith('http://') 
        ? `/proxy/video?u=${encodeURIComponent(video.url)}`
        : video.url;
      
      return (
        <div className="relative w-full">
          <video
            controls
            className="w-full h-auto max-h-[70vh] rounded-lg"
            data-testid={`nas-player-${video.id}`}
            onError={(e) => {
              console.error('동영상 재생 오류:', e);
              alert('동영상을 재생할 수 없습니다. URL을 확인해주세요.');
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            죄송합니다. 브라우저가 동영상을 지원하지 않습니다.
          </video>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-full overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`video-title-${video.id}`}>
              {video.title}
            </h2>
            <Button 
              variant="outline" 
              onClick={onClose}
              data-testid="button-close-player"
            >
              닫기
            </Button>
          </div>
          
          {renderVideo()}
          
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {video.type === 'youtube' ? 'YouTube' : 'NAS 파일'}
            </span>
            <span>{new Date(video.createdAt).toLocaleDateString('ko-KR')}</span>
            {video.type === 'nas' && (
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400"
                data-testid={`link-external-${video.id}`}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                새 탭에서 열기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Videos = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos'],
    refetchOnWindowFocus: false,
  }) as { data: Video[] | undefined; isLoading: boolean; error: Error | null };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12" data-testid="videos-loading">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12" data-testid="videos-error">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600 dark:text-gray-400">동영상을 불러오는 중 문제가 발생했습니다.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              data-testid="button-retry"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12" data-testid="videos-page">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="page-title">
              학습 동영상
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              시대영재 학원의 온라인 학습 콘텐츠를 만나보세요
            </p>
          </div>

          {!videos || videos.length === 0 ? (
            <div className="text-center py-16" data-testid="no-videos">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Play className="w-16 h-16 mx-auto mb-4" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                아직 동영상이 없습니다
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                곧 유익한 학습 동영상들이 업로드될 예정입니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="videos-grid">
              {videos.map((video) => (
                <Card 
                  key={video.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                  data-testid={`video-card-${video.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2" data-testid={`card-title-${video.id}`}>
                        {video.title}
                      </CardTitle>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                        video.type === 'youtube' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {video.type === 'youtube' ? 'YouTube' : 'NAS'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <Button size="sm" data-testid={`button-play-${video.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        재생
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </>
  );
};

export default Videos;