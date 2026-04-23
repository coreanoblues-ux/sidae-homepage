import { useState, useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link, useLocation } from "wouter";
import { Star, Trophy, University, Presentation, Video, Phone, Calendar, Medal, Laptop, ChartLine, MapPin, Mail, NotebookPen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gallery } from "@/components/shared/Gallery";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

// Hero slideshow data
const heroSlides = [
  {
    gif: "/images/real_page1.gif",   // slide 0: GIF (관리자 클릭)
    badge: null,
    headlineTop: "",
    headlineHighlight: "",
    sub: "",
  },
  {
    gif: "/images/Hero_2.gif",   // slide 1: GIF
    badge: null,
    headlineTop: "",
    headlineHighlight: "",
    sub: "",
  },
  {
    gif: null,
    badge: "실제 합격생 후기 기반",
    headlineTop: "수능 영어 1등급,",
    headlineHighlight: "이제 우리 아이 차례",
    sub: "내신 · 수능 완벽 대응 커리큘럼",
  },
  {
    gif: null,
    badge: "검증된 강의력 · 독보적 커리큘럼",
    headlineTop: "일반고 최상위권의 선택,",
    headlineHighlight: "영재고·상산고가 다시 찾는",
    sub: "영재고·상산고 입학생이 다시 찾는 독보적 강의, 검증된 실력이 만드는 차이를 경험하세요",
  },
];

export default function Landing() {
  // SEO 메타태그 — 홈
  useSEO({
    title: "봉선동 영어학원 | 시대영재학원 — 내신·수능 영어 전문",
    description: "봉선동 영어학원 시대영재학원. 강남영단기 1타·해커스 인기강사 출신 원장 직강. 광주 남구 봉선동 중고등 내신·수능 영어 전문.",
    ogUrl: "https://www.sidae-edu.com/",
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Hero slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slideshow (hover 일시정지 제거 — 항상 안정적으로 전환)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // /api/dev/login으로 실제 로그인 처리
      const response = await fetch('/api/dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 로그인 성공 - 관리자 쿠키 설정됨
        setPassword("");
        setShowPasswordDialog(false);

        // 잠시 대기 후 관리자 페이지로 이동
        setTimeout(() => {
          window.location.href = "/admin-dashboard"; // 🎯 통합: 관리자는 /admin-dashboard로
        }, 500);
      } else {
        alert("잘못된 비밀번호입니다.");
        setPassword("");
      }
    } catch (error) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setPassword("");
    }
  };

  const handleSpecialClick = () => {
    setShowPasswordDialog(true);
  };

  // CTA 버튼 클릭 핸들러 (핵심 로직) - 상단 '동영상' 버튼과 동일한 페이지로 연결
  const onClickCTA = () => {
    if (isAuthenticated && ((user as any)?.role === 'VERIFIED' || (user as any)?.role === 'ADMIN')) {
      setLocation('/videos'); // 모든 인증된 사용자는 동영상 페이지로
    } else {
      setLocation('/login'); // 비로그인/PENDING은 로그인으로
    }
  };

  // Gallery images - 실제 시대영재 학원 이미지들
  const galleryImages = [
    "/uploads/IMG_6558_1758101099677.JPG",
    "/uploads/IMG_6544_1758101075476.JPG",
    "/uploads/academy-hallway-1.png",
    "/uploads/academy-banner-1.jpg",
    "/uploads/academy-interior-1.JPG",
    "/uploads/IMG_6556_1758101093935.JPG",
    "/uploads/IMG_6559_1758101109393.JPG",
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

      {/* ═══════════════════════════════════════════
          HERO SECTION — 모든 슬라이드 동일 레이아웃
      ═══════════════════════════════════════════ */}
      <section
        className="relative h-screen overflow-y-auto overflow-x-hidden"
        style={{ background: 'linear-gradient(160deg, #F0F0F2 0%, #EBEBED 50%, #F0F0F2 100%)' }}
      >
        {/* 공통 컨테이너 — 모든 슬라이드 동일 구조 */}
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 text-center relative z-10">
          <div className="w-full max-w-4xl mx-auto">

            {/* ── GIF 슬라이드 (gif 속성이 있는 슬라이드) ── */}
            {heroSlides[currentSlide].gif && (
              <div
                key={`gif-${currentSlide}`}
                className="fade-in cursor-pointer mb-5"
                onClick={currentSlide === 0 ? handleSpecialClick : undefined}
              >
                <img
                  src={heroSlides[currentSlide].gif!}
                  alt="시대영재학원 히어로 슬라이드"
                  className="mx-auto w-auto h-auto max-w-full"
                  style={{ maxHeight: '44vh' }}
                />
              </div>
            )}

            {/* ── 텍스트 슬라이드 (gif 속성이 없는 슬라이드) ── */}
            {!heroSlides[currentSlide].gif && (
              <div key={currentSlide} className="fade-in mb-5">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B00] text-sm font-medium mb-4">
                  <Star className="w-3.5 h-3.5 mr-2 fill-[#FF6B00] text-[#FF6B00] flex-shrink-0" />
                  <span>{heroSlides[currentSlide].badge}</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
                  {heroSlides[currentSlide].headlineTop}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-orange-500">
                    {heroSlides[currentSlide].headlineHighlight}
                  </span>
                </h1>
                <p className="text-base lg:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                  {heroSlides[currentSlide].sub}
                </p>
              </div>
            )}

            {/* ── 공통 하단 콘텐츠 (모든 슬라이드에서 표시) ── */}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
              <Button
                size="lg"
                className="px-7 py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-200 transition-all hover:scale-105 border-0"
                onClick={onClickCTA}
                data-testid="button-cta-online-lecture"
              >
                <Video className="mr-2 w-5 h-5" />
                시대영재 온라인 강의 듣기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-7 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold text-base transition-all"
                asChild
              >
                <a href="tel:062-462-0990">
                  <Phone className="mr-2 w-5 h-5" />
                  062-462-0990
                </a>
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-5 py-3 border-y border-gray-200">
              <div className="text-center">
                <p className="text-xl lg:text-2xl font-black text-[#FF6B00]">990점</p>
                <p className="text-xs text-gray-400 mt-1 tracking-wide uppercase">TOEIC 만점</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xl lg:text-2xl font-black text-[#FF6B00]">50만+</p>
                <p className="text-xs text-gray-400 mt-1 tracking-wide uppercase">(전)해커스인강</p>
              </div>
              <div className="text-center">
                <p className="text-xl lg:text-2xl font-black text-[#FF6B00]">1타</p>
                <p className="text-xs text-gray-400 mt-1 tracking-wide uppercase">(전)강남영단기</p>
              </div>
            </div>

            {/* 레벨테스트 CTA */}
            <div className="mb-5">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSd_c2YdUxewRPDwW3I6FAnngfEVysh5oYu8CwctR14ne5RnBg/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-base font-black rounded-2xl shadow-xl shadow-orange-200 transition-all hover:scale-105"
                data-testid="button-level-test-apply"
              >
                <NotebookPen className="w-5 h-5 flex-shrink-0" />
                레벨테스트 / 입학대기 신청
              </a>
              <p className="text-sm text-gray-400 mt-2">온라인으로 간편하게 신청 · 영업일 1일 이내 연락</p>
            </div>

            {/* Slide indicator dots */}
            <div className="flex items-center justify-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`rounded-full transition-all duration-500 ${
                    i === currentSlide
                      ? 'w-8 h-2.5 bg-[#FF6B00]'
                      : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`슬라이드 ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Prev / Next arrows ── */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF6B00] flex items-center justify-center transition-all shadow-sm"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF6B00] flex items-center justify-center transition-all shadow-sm"
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* ═══════════════════════════════════════════
          PROGRAMS SECTION
      ═══════════════════════════════════════════ */}
      <section id="programs" className="py-20 bg-muted/30 pattern-bg-alt scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Programs</p>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
              왜 시대영재 학원인가?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              중고등부 입시영어에 특화된 차별화된 커리큘럼으로 확실한 성적 향상을 보장합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-border/60">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Medal className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">중등부 프로그램</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  탄탄한 문법 만들기와 정확하고 빠른 독해 습관 만들기로 고등학교 진학 완벽 준비
                </p>
                <Link href="/curriculum/middle" className="flex items-center text-sm text-primary font-semibold hover:underline" data-testid="link-program-middle">
                  <span>중등부 커리큘럼 보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover border-border/60">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Laptop className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">고등부 프로그램</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  (일반고/특목고) 서술형 문제 정복과 SYNTAX구문독해로 대학입시 완벽 대비
                </p>
                <Link href="/curriculum/high" className="flex items-center text-sm text-primary font-semibold hover:underline" data-testid="link-program-high">
                  <span>고등부 커리큘럼 보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover border-border/60">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <ChartLine className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">내신 & 수능 대비</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  학교별 내신 및 수능지문에 대한 정독&스킬 강의로 실전 점수 향상 보장
                </p>
                <Link href="/program/exam-prep" className="flex items-center text-sm text-primary font-semibold hover:underline" data-testid="link-program-exam">
                  <span>내신/수능 프로그램 보기</span>
                  <ChartLine className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ABOUT SECTION
      ═══════════════════════════════════════════ */}
      <section id="about" className="py-20 geometric-shapes">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">About</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Presentation className="mr-2 w-4 h-4" />
                원장 소개
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-6">
                실력있는 원장과 탄탄한 강사진
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                (전)강남영단기 1타강사 출신 캐나다국적 원장과 서울대, 경희대, 광주교대 출신
                교육학 석사 자격을 갖춘 최고의 강사진이 함께합니다.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Medal className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">내신과 수능 두마리 토끼를 확실히 잡아 주는 영어 잘하는 학원</h4>
                    <p className="text-muted-foreground mt-1">체계적인 커리큘럼으로 내신과 수능 모두 완벽 대비</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <University className="text-orange-600 dark:text-orange-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Bishop's University (캐나다)</h4>
                    <p className="text-muted-foreground mt-1">우등졸업 (with honors), 현지 문화와 언어에 대한 깊은 이해</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">TOEIC 990점 만점 달성</h4>
                    <p className="text-muted-foreground mt-1">완벽한 영어 실력을 바탕으로 한 체계적인 시험 대비 전략</p>
                    <img
                      src="/uploads/IMG_6544_1758101075476.JPG"
                      alt="TOEIC 990점 만점 성적표"
                      className="mt-2 rounded-xl shadow-md max-w-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Presentation className="text-green-600 dark:text-green-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">(전)강남영단기 1타강사 & (전) 해커스 50만뷰+</h4>
                    <p className="text-muted-foreground mt-1">현강 1타강사와 인터넷 50만뷰 돌파 인기강사의 검증된 강의력</p>
                    <img
                      src="/uploads/IMG_6559_1758101109393.JPG"
                      alt="해커스 온라인 강의 화면"
                      className="mt-2 rounded-xl shadow-md max-w-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSd_c2YdUxewRPDwW3I6FAnngfEVysh5oYu8CwctR14ne5RnBg/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-8 px-7 py-3.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-105"
                data-testid="button-about-apply"
              >
                <NotebookPen className="mr-2 w-5 h-5" />
                레벨테스트 / 입학대기 신청
              </a>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main team photo */}
                <div className="col-span-1 relative">
                  <img
                    src="/images/team-photo.PNG"
                    alt="시대영재 학원 강사진"
                    className="rounded-2xl shadow-2xl object-cover w-full h-[400px] transform hover:scale-105 transition-transform duration-300"
                    width="600"
                    height="400"
                    fetchPriority="high"
                  />
                  <div className="absolute -bottom-4 left-4 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border/40">
                    <p className="text-sm font-bold text-foreground">검증된 강사진과 고등부 내신을 위한 학교별 데이터 전략 분석 센터</p>
                    <p className="text-xs text-muted-foreground mt-1">캐나다 Bishop's University 졸업, TOEIC990 만점, (전)해커스, (전)강남영단기 1타 &nbsp;원장 정우석</p>
                    <p className="text-xs text-muted-foreground mt-0.5">서울대 사학과 졸업, 멘사 만점회원 &nbsp;팀장 이홍석</p>
                  </div>
                </div>

                {/* Magazine cover */}
                <div className="col-span-1 flex flex-col justify-center">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300 border border-orange-200/50 dark:border-orange-700/30">
                    <img
                      src="/images/magazine-cover.PNG"
                      alt="1타강사 인증"
                      className="rounded-xl shadow-lg object-cover w-full max-w-xs mx-auto"
                      width="320"
                      height="400"
                      loading="lazy"
                    />
                    <div className="text-center mt-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-800/50 dark:text-orange-100 font-semibold">
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

      {/* ═══════════════════════════════════════════
          GALLERY SECTION
      ═══════════════════════════════════════════ */}
      <section id="gallery" className="py-20 bg-muted/30 pattern-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Gallery</p>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
              학원 갤러리
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              시대영재 학원의 교육 환경과 수업 현장을 확인해보세요.
            </p>
          </div>

          <Gallery images={galleryImages} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS SECTION
      ═══════════════════════════════════════════ */}
      <section className="py-20 pattern-bg-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
              수강생 후기
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              시대영재 학원에서 실제로 성과를 얻은 수강생들의 생생한 후기를 확인해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "중학교 때까지는 문법·독해가 제일 약했어요. 고등학교 올라오면서 루틴을 다시 잡았고, 영어만큼은 한 번도 1등급을 놓치지 않았습니다. 솔직히 서울대 합격의 결정타는 영어였어요.",
                author: "배*두",
                course: "고등부 수능/내신"
              },
              {
                rating: 5,
                text: "초반엔 빈칸/문장삽입이 무서웠는데, 유형별 해설 루틴대로 하니 3→2→1등급으로 안정됐습니다. '해석보다 구조'라는 말이 실감났습니다. 감사합니다.",
                author: "*형*",
                course: "수능대비반"
              },
              {
                rating: 5,
                text: "내신 3등급 초반이었는데 서술형 영작 템플릿이 큰 도움 됐어요. 중간·기말 모두 1등급으로 마무리했습니다.",
                author: "김*현",
                course: "고2 내신반"
              },
              {
                rating: 5,
                text: "오답을 '왜 틀렸는지' 한 줄로 적게 하신 게 신의 한 수. 모의 2등급대 → 수능 1등급 나왔습니다.",
                author: "이*서",
                course: "고3 파이널"
              },
              {
                rating: 5,
                text: "문법이 제일 싫었는데, 5문형→구조 읽기로 바꾸니 독해 속도가 확 늘었습니다. 내신도 자연스럽게 올랐어요.",
                author: "박*진",
                course: "고1 기본밀기"
              },
              {
                rating: 5,
                text: "문법은 버리려 했는데, 핵심만 압축된 핸드아웃으로 한 달 만에 빈칸/문법문항 전부 맞췄습니다.",
                author: "최*윤",
                course: "고3 파이널 문법특강"
              },
              {
                rating: 5,
                text: "학교 연구 일정 때문에 시간이 없었는데, 파트별 시간배분/패러프레이즈 리스트로 첫 응시 940점 받았습니다. 필요만 딱 잡아준 게 컸습니다.",
                author: "오*찬",
                course: "광주영재고 · TOEIC"
              },
              {
                rating: 5,
                text: "단어만 외우던 습관을 버리고 지문 '중심/전환'만 표시했어요. 모고 3→1등급, 내신도 안정됐습니다.",
                author: "유*빈",
                course: "고2 내신·모고 병행"
              },
              {
                rating: 5,
                text: "매주 미니 모의고사와 해설 코멘트가 압도적이었어요. 9월 평가원 이후 전 과목 중 영어가 제일 안정됐습니다.",
                author: "한*호",
                course: "고3 실전모의반"
              },
              {
                rating: 5,
                text: "중2 때는 해석이 늘 막혔는데, 문장 성분 표시 연습으로 지문 읽는 속도가 확실히 달라졌어요. 모의 90점대 꾸준히 유지 중입니다.",
                author: "정*아",
                course: "중등부 심화"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-orange-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground font-medium">5.0</span>
                  </div>
                  <p className="text-card-foreground mb-4 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {testimonial.author[0]}
                    </div>
                    <div className="ml-3">
                      <p className="font-bold text-card-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONTACT SECTION
      ═══════════════════════════════════════════ */}
      <section id="contact" className="py-20 bg-muted/30 geometric-shapes">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Contact</p>
              <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
                상담 및 문의
              </h2>
              <p className="text-lg text-muted-foreground">
                궁금한 것이 있으시거나 상담을 원하신다면 언제든지 연락주세요.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg">학원 위치</h4>
                    <p className="text-muted-foreground mt-1">광주광역시 남구 봉선중앙로16, 2층</p>
                    <p className="text-sm text-muted-foreground mt-1">문의전화: 062-462-0990</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">전화 상담</h4>
                    <p className="text-muted-foreground mt-1">062-462-0990</p>
                    <p className="text-sm text-muted-foreground mt-1">상담시간: 월-금 14:00-22:00, 토-일 09:30-18:00</p>
                  </div>
                </div>
              </div>

              {/* 구글 지도 */}
              <div className="w-full">
                <iframe
                  src={`https://maps.google.com/maps?width=600&height=400&hl=ko&q=${encodeURIComponent('광주광역시 남구 봉선중앙로16 시대영재학원')}&ie=UTF8&t=&z=17&iwloc=B&output=embed`}
                  width="100%"
                  height="400"
                  style={{border: 0, borderRadius: '16px'}}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="shadow-lg"
                  title="시대영재학원 위치"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <img
                  src="/images/logo-footer.png"
                  alt="시대영재 학원"
                  className="h-10 w-auto object-contain"
                />
                <p className="text-sm text-secondary-foreground/70 mt-2">광주광역시 남구 봉선중앙로16, 2층</p>
              </div>
              <p className="text-secondary-foreground/75 mb-4 leading-relaxed">
                실력 있는 강사가 실력 있는 학생을 만든다는 믿음, 시대영재의 시작입니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">학원 정보</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/75">
                <li><a href="#about" className="hover:text-primary transition-colors">원장 소개</a></li>
                <li><a href="/courses" className="hover:text-primary transition-colors">강의 과정</a></li>
                <li><a href="/gallery" className="hover:text-primary transition-colors">갤러리</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">오시는 길</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">학습 지원</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground/75">
                <li><a href="/api/login" className="hover:text-primary transition-colors">온라인 학습</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">학습 자료</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">모의고사</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/15 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-secondary-foreground/55">
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
