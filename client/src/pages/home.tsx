import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Clock, Users, Trophy, Video, Calendar } from "lucide-react";

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

export default function Home() {
  const { user } = useAuth();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: notices = [], isLoading: noticesLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200";
      case "VERIFIED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "VERIFIED":
        return "인증 회원";
      case "PENDING":
        return "승인 대기";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              안녕하세요, {user?.firstName || "회원"}님!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              시대영재 학원에 오신 것을 환영합니다. 오늘도 영어 실력 향상을 위해 함께 노력해봐요.
            </p>
            
            <div className="flex items-center justify-center mb-8">
              <Badge className={`text-lg px-4 py-2 ${getRoleBadgeColor(user?.role || "")}`}>
                {getRoleLabel(user?.role || "")}
              </Badge>
            </div>

            {user?.role === "PENDING" && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  회원 승인 대기 중
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  관리자의 승인이 완료되면 모든 강의를 수강할 수 있습니다. 
                  조금만 기다려주세요.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/courses">
                  <BookOpen className="mr-2 w-5 h-5" />
                  강의 둘러보기
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/account">
                  <Users className="mr-2 w-5 h-5" />
                  내 계정 관리
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{courses.length}</h3>
                <p className="text-muted-foreground">강의 과정</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">50+</h3>
                <p className="text-muted-foreground">동영상 강의</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">990</h3>
                <p className="text-muted-foreground">토익 만점</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">24/7</h3>
                <p className="text-muted-foreground">언제든 수강</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Courses */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">최신 강의</h2>
            <Button variant="outline" asChild>
              <Link href="/courses">모든 강의 보기</Link>
            </Button>
          </div>

          {coursesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="bg-muted h-4 rounded w-3/4 mb-4"></div>
                    <div className="bg-muted h-3 rounded w-1/2 mb-2"></div>
                    <div className="bg-muted h-3 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course) => (
                <Card key={course.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {course.title}
                      </h3>
                      {user?.role === "PENDING" && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          승인 후 열람
                        </Badge>
                      )}
                      {user?.role === "VERIFIED" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          수강 가능
                        </Badge>
                      )}
                    </div>
                    
                    {course.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>
                        강의 상세보기
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Active Notices */}
      {notices.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8">공지사항</h2>
            
            {noticesLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="bg-muted h-4 rounded w-1/3 mb-2"></div>
                      <div className="bg-muted h-3 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {notices.slice(0, 3).map((notice) => (
                  <Card key={notice.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground line-clamp-2">
                        {notice.body}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Admin Quick Access */}
      {user?.role === "ADMIN" && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8">관리자 메뉴</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">회원 관리</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    대기 중인 회원 승인/거절
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/members">관리하기</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <Video className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">동영상 관리</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    강의 동영상 등록/수정
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/videos">관리하기</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">강의 관리</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    강의 과정 생성/편집
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/courses">관리하기</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">공지사항</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    공지사항 작성/관리
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/notices">관리하기</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
