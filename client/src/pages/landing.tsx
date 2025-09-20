import { useState } from "react";
import { Star, Trophy, University, Presentation, Video, Phone, Calendar, Medal, Laptop, ChartLine, MapPin, Mail, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gallery } from "@/components/shared/Gallery";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  course: z.string().optional(),
  message: z.string().optional(),
});

export default function Landing() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      course: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    setIsSubmitting(true);
    try {
      // In a real implementation, this would send to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "상담 신청 완료",
        description: "신청해주셔서 감사합니다. 빠른 시일 내에 연락드리겠습니다.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gallery images
  const galleryImages = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
                <Star className="text-yellow-400 mr-2 w-4 h-4" />
                토익 만점 강사의 검증된 커리큘럼
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                영어 실력의<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  완전한 변화
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed">
                캐나다 Bishop's University 졸업, 해커스·영단기 인기강사 출신<br />
                <strong>정우석 원장</strong>과 함께하는 프리미엄 영어 교육
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all transform hover:scale-105"
                  asChild
                >
                  <a href="/api/login">
                    <Video className="mr-2 w-5 h-5" />
                    온라인 강의 시작하기
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 border-2 border-white text-white font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  상담 문의하기
                </Button>
              </div>
            </div>

            <div className="fade-in lg:ml-8">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
                alt="정우석 원장 프로필 사진"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto object-cover aspect-[4/5]"
              />

              <div className="relative -mt-16 mx-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg transform rotate-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Trophy className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">TOEIC 990점</p>
                      <p className="text-sm text-gray-600">만점 달성</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg transform -rotate-1 -mt-2 ml-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <University className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Bishop's University</p>
                      <p className="text-sm text-gray-600">캐나다 명문대 졸업</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              왜 정우석 영어학원인가?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              검증된 강사진과 체계적인 커리큘럼으로 여러분의 영어 실력을 한 단계 높여드립니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Medal className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">검증된 강사진</h3>
                <p className="text-muted-foreground mb-4">
                  해커스, 영단기 출신 인기강사의 노하우와 캐나다 유학 경험을 바탕으로 한 실용적인 영어 교육
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  <span>더 알아보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Laptop className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">온라인 학습 시스템</h3>
                <p className="text-muted-foreground mb-4">
                  언제 어디서나 접근 가능한 온라인 강의 플랫폼으로 효율적인 학습을 지원합니다
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  <span>시스템 체험하기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <ChartLine className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">맞춤형 커리큘럼</h3>
                <p className="text-muted-foreground mb-4">
                  개인별 수준과 목표에 맞춘 체계적인 학습 계획으로 확실한 실력 향상을 보장합니다
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  <span>커리큘럼 보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Presentation className="mr-2 w-4 h-4" />
                원장 소개
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                정우석 원장
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                10년 이상의 영어 교육 경험과 해외 유학 경험을 바탕으로 
                학생들의 영어 실력 향상을 위해 최선을 다하고 있습니다.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <University className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Bishop's University (캐나다)</h4>
                    <p className="text-muted-foreground">영어영문학과 졸업, 현지 문화와 언어에 대한 깊은 이해</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">TOEIC 990점 만점 달성</h4>
                    <p className="text-muted-foreground">완벽한 영어 실력을 바탕으로 한 체계적인 시험 대비 전략</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Presentation className="text-green-600 dark:text-green-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">해커스·영단기 인기 강사</h4>
                    <p className="text-muted-foreground">대형 학원에서 검증된 강의력과 수많은 학생들의 성공 사례</p>
                  </div>
                </div>
              </div>

              <Button className="mt-8" size="lg">
                <Calendar className="mr-2 w-5 h-5" />
                상담 예약하기
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
                alt="정우석 원장 프로필"
                className="rounded-xl shadow-lg object-cover aspect-[3/4] w-full"
              />

              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="강의 중인 정우석 원장"
                  className="rounded-xl shadow-lg object-cover aspect-[3/2] w-full"
                />

                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="학위증서 및 자격증"
                  className="rounded-xl shadow-lg object-cover aspect-[3/2] w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              학원 갤러리
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              정우석 영어학원의 교육 환경과 수업 현장을 확인해보세요.
            </p>
          </div>

          <Gallery images={galleryImages} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              수강생 후기
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              정우석 영어학원에서 실제로 성과를 얻은 수강생들의 생생한 후기를 확인해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "토익 점수가 650점에서 920점으로 올랐어요! 정우석 원장님의 체계적인 커리큘럼과 개인별 맞춤 지도 덕분입니다.",
                author: "김○○ 님",
                course: "직장인 토익반"
              },
              {
                rating: 5,
                text: "온라인 강의 시스템이 정말 편리해요. 언제든지 복습할 수 있어서 실력 향상에 큰 도움이 되었습니다.",
                author: "이○○ 님",
                course: "대학생 회화반"
              },
              {
                rating: 5,
                text: "원장님의 해외 경험과 노하우가 정말 도움이 많이 되었습니다. 실용적인 영어를 배울 수 있어서 좋았어요.",
                author: "박○○ 님",
                course: "비즈니스 영어반"
              }
            ].map((testimonial, index) => (
              <Card key={index}>
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                상담 및 문의
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                궁금한 것이 있으시거나 상담을 원하신다면 언제든지 연락주세요.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">학원 위치</h4>
                    <p className="text-muted-foreground">광주광역시 동구 봉선동 교육 1번지</p>
                    <p className="text-sm text-muted-foreground mt-1">지하철 1호선 봉선역 2번 출구 도보 3분</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">전화 상담</h4>
                    <p className="text-muted-foreground">062-123-4567</p>
                    <p className="text-sm text-muted-foreground mt-1">상담시간: 월-금 09:00-22:00, 토 09:00-18:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">이메일 문의</h4>
                    <p className="text-muted-foreground">info@jwsacademy.co.kr</p>
                    <p className="text-sm text-muted-foreground mt-1">24시간 접수, 1일 이내 답변</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                  온라인 상담 신청
                </h3>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이름 *</FormLabel>
                          <FormControl>
                            <Input placeholder="성함을 입력해주세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연락처 *</FormLabel>
                          <FormControl>
                            <Input placeholder="휴대폰 번호를 입력해주세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>관심 과정</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="선택해주세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="toeic">토익 완전정복</SelectItem>
                              <SelectItem value="business">비즈니스 영어</SelectItem>
                              <SelectItem value="conversation">영어 회화 마스터</SelectItem>
                              <SelectItem value="other">기타</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>문의 내용</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="궁금한 점이나 상담받고 싶은 내용을 자유롭게 작성해주세요"
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      <NotebookPen className="mr-2 w-5 h-5" />
                      {isSubmitting ? "전송 중..." : "상담 신청하기"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      개인정보는 상담 목적으로만 사용되며, 상담 완료 후 즉시 삭제됩니다.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Presentation className="text-primary-foreground w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">정우석 영어학원</h3>
                  <p className="text-sm text-secondary-foreground/70">광주 봉선동 교육 1번지</p>
                </div>
              </div>
              <p className="text-secondary-foreground/80 mb-4 leading-relaxed">
                캐나다 Bishop's University 졸업, 토익 만점, 해커스·영단기 출신 인기강사 정우석 원장과 함께 
                영어 실력의 완전한 변화를 경험해보세요.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">학원 정보</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li><a href="#about" className="hover:text-primary transition-colors">원장 소개</a></li>
                <li><a href="/courses" className="hover:text-primary transition-colors">강의 과정</a></li>
                <li><a href="/gallery" className="hover:text-primary transition-colors">갤러리</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">오시는 길</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">학습 지원</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li><a href="/api/login" className="hover:text-primary transition-colors">온라인 학습</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">학습 자료</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">모의고사</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-secondary-foreground/60">
              <p>&copy; 2024 정우석 영어학원. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-primary transition-colors">이용약관</a>
                <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
