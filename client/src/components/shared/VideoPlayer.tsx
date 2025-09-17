import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Video {
  id: string;
  title: string;
  description?: string;
  durationSec?: number;
  isPublished: boolean;
  accessStart?: string;
  accessEnd?: string;
}

interface VideoPlayerProps {
  video: Video;
  className?: string;
}

export function VideoPlayer({ video, className = "" }: VideoPlayerProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [video.id, isAuthenticated]);

  const checkAccess = async () => {
    if (!isAuthenticated) {
      setCanView(false);
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest("GET", `/api/videos/${video.id}/can-view`);
      const data = await response.json();
      setCanView(data.canView);
    } catch (error) {
      console.error("Error checking video access:", error);
      setCanView(false);
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    if (!isAuthenticated) return;

    try {
      await apiRequest("POST", `/api/videos/${video.id}/view`);
    } catch (error) {
      console.error("Error recording video view:", error);
    }
  };

  const handlePlay = async () => {
    if (canView) {
      setLoadingVideo(true);
      try {
        const response = await apiRequest("GET", `/api/videos/${video.id}/url`);
        const data = await response.json();
        setVideoUrl(data.url);
        setPlaying(true);
        recordView();
      } catch (error) {
        console.error("Error fetching video URL:", error);
        toast({
          title: "동영상 로드 실패",
          description: "동영상을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      } finally {
        setLoadingVideo(false);
      }
    } else {
      toast({
        title: "접근 권한이 없습니다",
        description: "이 동영상을 시청하려면 회원 승인이 필요합니다.",
        variant: "destructive",
      });
    }
  };

  const getAccessStatus = () => {
    const now = new Date();
    const start = video.accessStart ? new Date(video.accessStart) : null;
    const end = video.accessEnd ? new Date(video.accessEnd) : null;

    if (start && now < start) {
      return {
        status: "upcoming",
        label: `공개 예정 ${start.toLocaleDateString()}`,
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      };
    }

    if (end && now > end) {
      return {
        status: "expired",
        label: "시청 기간 만료",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    }

    if (start && end) {
      return {
        status: "active",
        label: `OPEN ~${end.toLocaleDateString()}`,
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    }

    return {
      status: "open",
      label: "시청 가능",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const accessStatus = getAccessStatus();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="bg-muted h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-muted h-3 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-muted-foreground text-sm mb-3">
                {video.description}
              </p>
            )}
          </div>
          <Badge className={`${accessStatus.color} ml-4`} variant="secondary">
            {accessStatus.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          {video.durationSec && (
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDuration(video.durationSec)}
            </span>
          )}
        </div>

        {canView && playing && videoUrl ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              controls
              className="w-full h-full"
              src={videoUrl}
              data-testid="video-player"
            >
              동영상을 지원하지 않는 브라우저입니다.
            </video>
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              {canView ? (
                <Button 
                  onClick={handlePlay} 
                  size="lg" 
                  className="mb-2" 
                  disabled={loadingVideo}
                  data-testid="button-play-video"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {loadingVideo ? "로딩 중..." : "동영상 재생"}
                </Button>
              ) : (
                <div className="flex flex-col items-center">
                  <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {user?.role === "PENDING"
                      ? "승인 후 시청 가능"
                      : "로그인이 필요합니다"}
                  </p>
                  {!isAuthenticated && (
                    <Button asChild variant="outline" data-testid="button-login">
                      <a href="/api/login">로그인하기</a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
