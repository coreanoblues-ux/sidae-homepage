import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Lock, Play, Clock, BookOpen, Users, Calendar } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function Courses() {
  // SEO 메타태그 — 수강 과정
  useSEO({
    title: "봉선동 영어학원 시대영재학원 — 수강 과정 안내",
    description: "봉선동 영어학원 시대영재학원 수강 과정. 중등 내신·고등 수능·서술형 완벽 대비 커리큘럼. 광주 남구 봉선동 영어 전문.",
    ogUrl: "https://www.sidae-edu.com/courses",
  });

  const { user, isAuthenticated } = useAuth();

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const getAccessBadge = () => {
    if (!isAuthenticated) {
      return {
        text: "로그인 필요",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        icon: <Lock className="w-3 h-3 mr-1" />
      };
    }

    switch (user?.role) {
      case "ADMIN":
        return {
          text: "관리자",
          className: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
          icon: <Play className="w-3 h-3 mr-1" />
        };
      case "VERIFIED":
        return {
          text: "수강 가능",
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          icon: <Play className="w-3 h-3 mr-1" />
        };
      case "PENDING":
        return {
          text: "승인 후 열람",
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
          icon: <Lock className="w-3 h-3 mr-1" />
        };
      default:
        return {
          text: "승인 필요",
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          icon: <Lock className="w-3 h-3 mr-1" />
        };
    }
  };

  const accessBadge = getAccessBadge();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="bg-muted h-8 rounded w-64 mx-auto mb-4"></div>
              <div className="bg-muted h-4 rounded w-96 mx-auto"></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="bg-muted h-4 rounded w-3/4 mb-4"></div>
                  <div className="bg-muted h-3 rounded w-1/2 mb-2"></div>
                  <div className="bg-muted h-3 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              온라인 강의 과정
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              체계적인 커리큘럼으로 구성된 온라인 강의를 통해 효과적으로 영어 실력을 향상시키세요.
              시대영재 학원 원장의 노하우가 집약된 프리미엄 강의를 만나보세요.
            </p>
            
            {!isAuthenticated && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  회원 가입이 필요합니다
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  모든 강의를 수강하려면 회원 가입 후 관리자 승인이 필요합니다.
                </p>
                <Button asChild data-testid="button-login">
                  <a href="/api/login">
                    <Users className="mr-2 w-4 h-4" />
                    회원가입 / 로그인
                  </a>
                </Button>
              </div>
            )}

            {user?.role === "PENDING" && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  승인 대기 중
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  관리자의 승인이 완료되면 모든 강의를 수강할 수 있습니다. 
                  조금만 기다려주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                아직 등록된 강의가 없습니다
              </h3>
              <p className="text-muted-foreground">
                곧 새로운 강의가 추가될 예정입니다.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Card key={course.id} className="card-hover overflow-hidden" data-testid={`card-course-${course.id}`}>
                  {/* Course Thumbnail */}
                  <div className="relative">
                    <img
                      src={course.thumbnail || `https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300`}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`${accessBadge.className} flex items-center`} variant="secondary">
                        {accessBadge.icon}
                        {accessBadge.text}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-card-foreground mb-2">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {course.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        온라인 강의
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button 
                      asChild 
                      className="w-full"
                      variant={isAuthenticated && user?.role === "VERIFIED" ? "default" : "outline"}
                      data-testid={`button-course-${course.id}`}
                    >
                      <Link href={`/courses/${course.id}`}>
                        {isAuthenticated && (user?.role === "VERIFIED" || user?.role === "ADMIN") ? (
                          <>
                            <Play className="mr-2 w-4 h-4" />
                            강의 수강하기
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-2 w-4 h-4" />
                            강의 상세보기
                          </>
                        )}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              강의의 특징
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              시대영재 학원의 온라인 강의만의 특별한 장점들을 확인해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card data-testid="card-feature-anytime">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  언제든 수강 가능
                </h3>
                <p className="text-muted-foreground">
                  24시간 언제든지 접근 가능한 온라인 플랫폼으로 
                  본인의 스케줄에 맞춰 학습할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-systematic">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="text-green-600 dark:text-green-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  체계적인 커리큘럼
                </h3>
                <p className="text-muted-foreground">
                  기초부터 고급까지 단계별로 구성된 
                  체계적인 커리큘럼으로 효과적인 학습이 가능합니다.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-expert">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="text-purple-600 dark:text-purple-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  전문가 강의
                </h3>
                <p className="text-muted-foreground">
                  토익 만점, 해외 유학 경험을 바탕으로 한 
                  전문적이고 실용적인 강의를 제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
