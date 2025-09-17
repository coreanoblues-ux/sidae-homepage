import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, User, Tag, Video as VideoIcon } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description?: string;
  durationSec?: number;
  isPublished: boolean;
  accessStart?: string;
  accessEnd?: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  tags: string[];
  order: number;
  videos: Video[];
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-muted h-8 rounded w-64 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-muted h-64 rounded-lg mb-6"></div>
                <div className="bg-muted h-6 rounded w-3/4 mb-4"></div>
                <div className="bg-muted h-4 rounded w-1/2"></div>
              </div>
              <div>
                <div className="bg-muted h-48 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              강의를 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground mb-8">
              요청하신 강의가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button asChild data-testid="button-back-to-courses">
              <Link href="/courses">
                <ArrowLeft className="mr-2 w-4 h-4" />
                강의 목록으로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canAccessVideos = isAuthenticated && (user?.role === "VERIFIED" || user?.role === "ADMIN");

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild data-testid="button-back">
            <Link href="/courses">
              <ArrowLeft className="mr-2 w-4 h-4" />
              강의 목록으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="text-course-title">
                {course.title}
              </h1>
              
              {course.description && (
                <p className="text-xl text-muted-foreground mb-6" data-testid="text-course-description">
                  {course.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center" data-testid={`badge-tag-${index}`}>
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  최근 업데이트
                </span>
                <span className="flex items-center">
                  <VideoIcon className="w-4 h-4 mr-1" />
                  {course.videos.length}개 강의
                </span>
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  시대영재 학원 원장
                </span>
              </div>
            </div>

            {/* Access Status Alert */}
            {!canAccessVideos && (
              <div className="mb-8">
                {!isAuthenticated ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      로그인이 필요합니다
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 mb-4">
                      강의를 시청하려면 회원 가입 후 관리자 승인이 필요합니다.
                    </p>
                    <Button asChild data-testid="button-login-alert">
                      <a href="/api/login">로그인 / 회원가입</a>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      승인 대기 중
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300">
                      관리자의 승인이 완료되면 모든 강의를 시청할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Video List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">강의 목록</h2>
              
              {course.videos.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <VideoIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      아직 등록된 강의가 없습니다
                    </h3>
                    <p className="text-muted-foreground">
                      곧 새로운 강의가 추가될 예정입니다.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                course.videos.map((video, index) => (
                  <VideoPlayer 
                    key={video.id} 
                    video={video} 
                    data-testid={`video-player-${index}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <Card data-testid="card-course-info">
              <CardHeader>
                <CardTitle>강의 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">강의 수</span>
                  <span className="font-semibold">{course.videos.length}개</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 시간</span>
                  <span className="font-semibold">
                    {course.videos.reduce((total, video) => total + (video.durationSec || 0), 0) > 0
                      ? `${Math.floor(course.videos.reduce((total, video) => total + (video.durationSec || 0), 0) / 3600)}시간 ${Math.floor((course.videos.reduce((total, video) => total + (video.durationSec || 0), 0) % 3600) / 60)}분`
                      : "미정"
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">강사</span>
                  <span className="font-semibold">시대영재 학원 원장</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">수준</span>
                  <span className="font-semibold">초급 ~ 고급</span>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">접근 권한</span>
                    <Badge 
                      className={
                        canAccessVideos 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      }
                    >
                      {canAccessVideos ? "시청 가능" : "승인 필요"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Card */}
            <Card data-testid="card-instructor">
              <CardHeader>
                <CardTitle>강사 소개</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src="@assets/IMG_6558_1758101099677.JPG"
                    alt="시대영재 학원 원장"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">시대영재 학원 원장</h3>
                    <p className="text-sm text-muted-foreground">토익 만점 강사</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  캐나다 Bishop's University 졸업, 해커스·영단기 인기강사 출신으로 
                  검증된 영어 교육 노하우를 제공합니다.
                </p>
                <Button variant="outline" size="sm" asChild data-testid="button-instructor-profile">
                  <Link href="/about">
                    <User className="mr-2 w-4 h-4" />
                    프로필 상세보기
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card data-testid="card-related">
              <CardHeader>
                <CardTitle>다른 강의</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  더 많은 강의를 확인해보세요.
                </p>
                <Button variant="outline" size="sm" asChild data-testid="button-all-courses">
                  <Link href="/courses">
                    <VideoIcon className="mr-2 w-4 h-4" />
                    모든 강의 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
