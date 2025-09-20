import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { BookOpen, Clock, Users, Trophy, Video, Calendar, ArrowLeft } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags: string[];
  order: number;
}

interface Notice {
  id: string;
  title: string;
  body: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

export default function Members() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: notices = [], isLoading: noticesLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  // 접근 권한 확인 - VERIFIED 사용자만 접근 가능
  if (!user || (user as any)?.role !== 'VERIFIED') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                인증회원 전용 서비스
              </h2>
              <p className="text-muted-foreground mb-4">
                이 페이지는 인증된 회원만 이용할 수 있습니다.
              </p>
              <div className="space-y-2">
                <Button onClick={() => setLocation('/')} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  메인으로 돌아가기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              안녕하세요, {(user as any)?.firstName || "회원"}님!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              시대영재 온라인 강의에 오신 것을 환영합니다. 오늘도 영어 실력 향상을 위해 함께 노력해봐요.
            </p>
            
            <div className="flex items-center justify-center mb-8">
              <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Trophy className="mr-2 h-4 w-4" />
                인증 회원
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground mb-1">
                  {courses.length}
                </div>
                <p className="text-sm text-muted-foreground">이용 가능한 강의</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Video className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground mb-1">50+</div>
                <p className="text-sm text-muted-foreground">동영상 강의</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground mb-1">990</div>
                <p className="text-sm text-muted-foreground">수강생 커뮤니티</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground mb-1">24/7</div>
                <p className="text-sm text-muted-foreground">언제든 수강 가능</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                이용 가능한 강의
              </h2>
              <p className="text-lg text-muted-foreground">
                전문 강사진이 제작한 고품질 온라인 강의를 수강하세요
              </p>
            </div>

            {coursesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    {course.thumbnail ? (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                        <Video className="h-12 w-12 text-primary" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {course.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          강의 보기
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    아직 등록된 강의가 없습니다
                  </h3>
                  <p className="text-muted-foreground">
                    곧 새로운 강의가 업데이트될 예정입니다.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Notices Section */}
      {notices.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  학원 공지사항
                </h2>
                <p className="text-lg text-muted-foreground">
                  중요한 소식을 놓치지 마세요
                </p>
              </div>

              <div className="space-y-4">
                {notices.slice(0, 5).map((notice) => (
                  <Card key={notice.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {notice.body.length > 150 
                          ? `${notice.body.substring(0, 150)}...` 
                          : notice.body}
                      </p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}