import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { University, Trophy, Presentation, Calendar, Star, Award, Globe, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
                <Presentation className="mr-2 w-4 h-4" />
                원장 소개
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                시대영재 학원 원장
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed">
                강남영단기 1타강사, 해커스 50만뷰+ 인기강사, TOEIC 990점<br />
                캐나다국적 원장이 직접 지도하는 중고등부 입시영어 전문교육
              </p>
              <Button 
                size="lg" 
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg"
                data-testid="button-consultation"
              >
                <Calendar className="mr-2 w-5 h-5" />
                상담 예약하기
              </Button>
            </div>

            <div className="fade-in">
              <img
                src="@assets/IMG_6558_1758101099677.JPG"
                alt="시대영재 학원 원장 프로필 사진"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto object-cover aspect-[4/5]"
                data-testid="img-profile-main"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              검증된 경력과 자격
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              국내외 명문 교육기관에서의 경험과 완벽한 영어 실력을 바탕으로 한 전문적인 교육을 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Education */}
            <Card className="card-hover" data-testid="card-education">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <University className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  Bishop's University
                </h3>
                <p className="text-muted-foreground mb-4">
                  캐나다 퀘벡주 명문 대학교 영어영문학과 졸업
                </p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  캐나다 유학
                </Badge>
              </CardContent>
            </Card>

            {/* TOEIC Score */}
            <Card className="card-hover" data-testid="card-toeic">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="text-yellow-600 dark:text-yellow-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  TOEIC 990점
                </h3>
                <p className="text-muted-foreground mb-4">
                  토익 만점 달성으로 검증된 완벽한 영어 실력
                </p>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  만점 달성
                </Badge>
              </CardContent>
            </Card>

            {/* Teaching Experience */}
            <Card className="card-hover" data-testid="card-experience">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Presentation className="text-green-600 dark:text-green-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  대형 학원 강사
                </h3>
                <p className="text-muted-foreground mb-4">
                  강남영단기 1타강사, 해커스 50만뷰+ 인기강사
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  검증된 강의력
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Background */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="@assets/IMG_6558_1758101099677.JPG"
                alt="TIME 잡지 스타일 TOEIC 포트레이트"
                className="rounded-xl shadow-lg object-cover aspect-[3/4] w-full"
                data-testid="img-profile-formal"
              />

              <div className="space-y-4">
                <img
                  src="@assets/IMG_6554_1758101087993.JPG"
                  alt="시대영재 학원 강사진 단체 사진"
                  className="rounded-xl shadow-lg object-cover aspect-[3/2] w-full"
                  data-testid="img-teaching-staff"
                />

                <img
                  src="@assets/IMG_6556_1758101093935.JPG"
                  alt="창의적인 교육 방법론"
                  className="rounded-xl shadow-lg object-cover aspect-[3/2] w-full"
                  data-testid="img-creative-education"
                />
              </div>
            </div>

            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                교육 철학과 접근법
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                단순한 암기식 학습을 넘어 실용적이고 체계적인 영어 교육을 통해 
                학생들이 자신감을 가지고 영어를 사용할 수 있도록 돕습니다.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">글로벌 경험</h4>
                    <p className="text-muted-foreground">
                      캐나다 현지에서의 유학 경험을 바탕으로 실제 영어권 문화와 
                      언어 사용법을 전달합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">개별 맞춤 교육</h4>
                    <p className="text-muted-foreground">
                      각 학생의 수준과 목표에 맞춘 개별화된 학습 계획으로 
                      효과적인 실력 향상을 도모합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">결과 중심 접근</h4>
                    <p className="text-muted-foreground">
                      명확한 목표 설정과 체계적인 피드백을 통해 
                      가시적인 성과를 만들어냅니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Highlights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              주요 성과
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              다년간의 교육 경험을 통해 쌓아온 검증된 성과들입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center" data-testid="card-stat-students">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <p className="text-muted-foreground">지도한 학생 수</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-stat-score">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">250+</div>
                <p className="text-muted-foreground">평균 점수 향상</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-stat-experience">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <p className="text-muted-foreground">년 교육 경험</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-stat-satisfaction">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground">학생 만족도</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              학생들의 평가
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              시대영재 학원 원장님과 함께 공부한 학생들의 생생한 후기입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "원장님의 체계적인 커리큘럼 덕분에 토익 점수가 300점이나 올랐어요. 정말 감사합니다!",
                author: "김지은",
                course: "토익 집중반",
                rating: 5
              },
              {
                text: "해외 경험을 바탕으로 한 실용적인 영어 표현들을 많이 배웠습니다. 회화 실력이 눈에 띄게 늘었어요.",
                author: "박민수",
                course: "비즈니스 영어반",
                rating: 5
              },
              {
                text: "온라인 강의도 오프라인만큼 알차고 체계적이에요. 언제든지 복습할 수 있어서 좋습니다.",
                author: "이수진",
                course: "온라인 회화반",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} data-testid={`card-testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">5.0</span>
                  </div>
                  <p className="text-card-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.author[0]}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-card-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              함께 영어 실력을 높여보세요
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              시대영재 학원 원장과 함께 체계적이고 효과적인 영어 학습을 시작해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" data-testid="button-start-learning">
                <Presentation className="mr-2 w-5 h-5" />
                강의 둘러보기
              </Button>
              <Button variant="outline" size="lg" data-testid="button-contact">
                <Calendar className="mr-2 w-5 h-5" />
                상담 신청하기
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
