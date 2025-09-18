import { useState } from "react";
import { Link } from "wouter";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Images are now in public/images folder

const contactFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  course: z.string().optional(),
  message: z.string().optional(),
});

export default function Landing() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");

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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "671321") {
      window.location.href = "/admin";
    } else {
      alert("잘못된 비밀번호입니다.");
    }
    setPassword("");
    setShowPasswordDialog(false);
  };

  const handleSpecialClick = () => {
    setShowPasswordDialog(true);
  };

  // Gallery images - 실제 시대영재 학원 이미지들
  const galleryImages = [
    "/images/IMG_6558_1758101099677.JPG",
    "/images/IMG_6544_1758101075476.JPG",
    "/images/IMG_6554_1758101087993.JPG",
    "/images/IMG_6556_1758101093935.JPG",
    "/images/IMG_6559_1758101109393.JPG",
  ];

  return (
    <div className="min-h-screen">
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>관리자 접속</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              data-testid="input-admin-password"
            />
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                }}
              >
                취소
              </Button>
              <Button type="submit" data-testid="button-admin-login">
                확인
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Hero Section */}
      <section className="hero-gradient pattern-bg text-white py-20 lg:py-32 relative z-0">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
                <Star className="text-yellow-400 mr-2 w-4 h-4" />
                만점 강사의 검증된 커리<span 
                  onClick={handleSpecialClick} 
                  className="hover:bg-white/20 px-1 rounded transition-colors cursor-pointer"
                >큘</span>럼
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                중고등부<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  입시영어 전문
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed">
                '(전) 영단기 현강 대표강사, (전)해커스 인강' 의 정우석 원장과 함께 하는 시대영재학원
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all transform hover:scale-105"
                  asChild
                >
                  <a href="/api/login">
                    <Video className="mr-2 w-5 h-5" />
                    시대영재 온라인 강의 듣기
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 border-2 border-gray-400 text-gray-400 font-semibold text-lg hover:bg-gray-400 hover:text-white transition-all"
                  asChild
                >
                  <a href="tel:062-462-0990">
                    <Phone className="mr-2 w-5 h-5" />
                    062-462-0990
                  </a>
                </Button>
              </div>
            </div>

            <div className="fade-in lg:ml-8">
              <img
                src="/images/new-team-photo.PNG"
                alt="시대영재 학원 전문 강사진"
                className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto object-cover float-slow"
              />

              <div className="relative -mt-16 mx-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg float-rotate-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Trophy className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">강남 1타강사</p>
                      <p className="text-sm text-gray-600">(전)영단기 현강 전타임 마감강사</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg -mt-2 ml-8 float-rotate-neg1">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <University className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">봉선동 시대영재 학원</p>
                      <p className="text-sm text-gray-600">중고등부 입시영어 전문</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg -mt-2 mr-4 float-rotate-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Medal className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">중등부 입시영어 * 고등부 내신*수능*TOEIC*TOEFL</p>
                      <p className="text-sm text-gray-600">완벽 대응 커리큘럼</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30 pattern-bg-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              왜 시대영재 학원인가?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              중고등부 입시영어에 특화된 차별화된 커리큘럼으로 확실한 성적 향상을 보장합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Medal className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">중등부 프로그램</h3>
                <p className="text-muted-foreground mb-4">
                  탄탄한 문법 만들기와 정확하고 빠른 독해 습관 만들기로 고등학교 진학 완벽 준비
                </p>
                <Link href="/program/middle-school" className="flex items-center text-sm text-primary font-medium hover:underline" data-testid="link-program-middle">
                  <span>중등부 커리큘럼 보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Laptop className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">고등부 프로그램</h3>
                <p className="text-muted-foreground mb-4">
                  (일반고/특목고) 서술형 문제 정복과 SYNTAX구문독해로 대학입시 완벽 대비
                </p>
                <Link href="/program/high-school" className="flex items-center text-sm text-primary font-medium hover:underline" data-testid="link-program-high">
                  <span>고등부 커리큘럼 보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <ChartLine className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">내신 & 수능 대비</h3>
                <p className="text-muted-foreground mb-4">
                  학교별 내신 및 수능지문에 대한 정독&스킬 강의로 실전 점수 향상 보장
                </p>
                <Link href="/program/exam-prep" className="flex items-center text-sm text-primary font-medium hover:underline" data-testid="link-program-exam">
                  <span>내신/수능 프로그램 보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 geometric-shapes">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Presentation className="mr-2 w-4 h-4" />
                원장 소개
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                실력있는 원장과 탄탄한 강사진
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                강남영단기 1타강사 출신 캐나다국적 원장과 서울대, 경희대, 광주교대 출신 
                교육학 석사 자격을 갖춘 최고의 강사진이 함께합니다.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Medal className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">내신과 수능 두마리 토끼를 확실히 잡아 주는 영어 잘하는 학원</h4>
                    <p className="text-muted-foreground">체계적인 커리큘럼으로 내신과 수능 모두 완벽 대비</p>
                  </div>
                </div>

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
                    <img 
                      src="/images/IMG_6544_1758101075476.JPG"
                      alt="TOEIC 990점 만점 성적표"
                      className="mt-2 rounded-lg shadow-md max-w-48 object-cover"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Presentation className="text-green-600 dark:text-green-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">강남영단기 1타강사 & 해커스 50만뷰+</h4>
                    <p className="text-muted-foreground">현강 1타강사와 인터넷 50만뷰 돌파 인기강사의 검증된 강의력</p>
                    <img 
                      src="/images/IMG_6559_1758101109393.JPG"
                      alt="해커스 온라인 강의 화면"
                      className="mt-2 rounded-lg shadow-md max-w-48 object-cover"
                    />
                  </div>
                </div>
              </div>

              <Button className="mt-8" size="lg">
                <Calendar className="mr-2 w-5 h-5" />
                상담 예약하기
              </Button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main team photo */}
                <div className="col-span-1">
                  <img
                    src="/images/team-photo.PNG"
                    alt="시대영재 학원 강사진"
                    className="rounded-xl shadow-2xl object-cover w-full h-[400px] transform hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <p className="text-sm font-semibold text-gray-900">시대영재 학원 전문 강사진</p>
                    <p className="text-xs text-gray-600">검증된 실력과 경험을 바탕으로 최고의 교육을 제공합니다</p>
                  </div>
                </div>
                
                {/* Magazine cover as secondary highlight */}
                <div className="col-span-1 flex flex-col justify-center">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <img
                      src="/images/magazine-cover.PNG"
                      alt="1타강사 인증"
                      className="rounded-lg shadow-lg object-cover w-full max-w-xs mx-auto"
                    />
                    <div className="text-center mt-4">
                      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                        인증받은 1타강사
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-muted/30 pattern-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                학원 갤러리
              </h2>
              {/* 관리자 로그인시에만 보이는 편집 버튼 */}
              {/* {user?.role === 'ADMIN' && (
                <Button variant="outline" size="sm" className="mb-4">
                  <Edit className="w-4 h-4 mr-2" />
                  갤러리 편집
                </Button>
              )} */}
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              시대영재 학원의 교육 환경과 수업 현장을 확인해보세요.
            </p>
          </div>

          <Gallery images={galleryImages} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 pattern-bg-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                수강생 후기
              </h2>
              {/* 관리자 로그인시에만 보이는 편집 버튼 */}
              {/* {user?.role === 'ADMIN' && (
                <Button variant="outline" size="sm" className="mb-4">
                  <Edit className="w-4 h-4 mr-2" />
                  후기 편집
                </Button>
              )} */}
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              시대영재 학원에서 실제로 성과를 얻은 수강생들의 생생한 후기를 확인해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "내신 3등급에서 2등급으로 올랐어요 그리고 선생님 덕분에 영어가 재미있어 져서 좋은 학교가고 학교생활이 재미 있습니다",
                author: "배*두",
                course: "고등부 내신반"
              },
              {
                rating: 5,
                text: "저같이 영어를 못하는 사람도 1등급이 가능 하구나 라는 생각이 들었어요 감사합니다",
                author: "*형*",
                course: "수능대비반"
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
      <section id="contact" className="py-20 bg-muted/30 geometric-shapes">
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
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">학원 위치</h4>
                    <p className="text-muted-foreground">광주광역시 남구 봉선중앙로16, 2층</p>
                    <p className="text-sm text-muted-foreground mt-1">문의전화: 062-462-0990</p>
                    
                    {/* 구글 지도 */}
                    <div className="mt-4">
                      <iframe 
                        src={`https://maps.google.com/maps?width=200&height=200&hl=ko&q=${encodeURIComponent('광주광역시 남구 봉선중앙로16 시대영재학원')}&ie=UTF8&t=&z=17&iwloc=B&output=embed`}
                        width="200" 
                        height="200" 
                        style={{border: 0, borderRadius: '8px'}} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="shadow-md"
                        title="시대영재학원 위치"
                      ></iframe>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">전화 상담</h4>
                    <p className="text-muted-foreground">062-462-0990</p>
                    <p className="text-sm text-muted-foreground mt-1">상담시간: 월-금 09:00-22:00, 토 09:00-18:00</p>
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
                  <h3 className="text-xl font-bold">시대영재 학원</h3>
                  <p className="text-sm text-secondary-foreground/70">광주광역시 남구 봉선중앙로16, 2층</p>
                </div>
              </div>
              <p className="text-secondary-foreground/80 mb-4 leading-relaxed">
강남영단기 1타강사, 해커스 50만뷰+ 인기강사, TOEIC 990점
                캐나다국적 원장과 함께하는 중고등부 입시영어 전문교육
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
              <p>&copy; 2024 시대영재 학원. All rights reserved.</p>
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
