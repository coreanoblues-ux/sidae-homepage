import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import { Link, useLocation } from "wouter";
import { Star, Trophy, University, Presentation, Video, Phone, Calendar, Medal, Laptop, ChartLine, MapPin, Mail, NotebookPen, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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
    title: "봉선동 영어학원 | 시대영재 X 페이지원 영어학원 — 오늘의 한 페이지가, 내일의 등급을 결정합니다",
    description: "오늘의 한 페이지가, 내일의 등급을 결정합니다. 시대영재 X 페이지원 영어학원 — 강남영단기 1타·해커스 인기강사 출신 원장 직강. 광주 남구 봉선동 중고등 내신·수능 영어 전문.",
    ogUrl: "https://www.sidae-edu.com/",
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [expandedProgram, setExpandedProgram] = useState<'middle' | 'high' | 'gifted' | null>(null);
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

  // ─────────────────────────────────────────────
  // 강사진 데이터 (About 섹션 - 4인 테이블)
  // ─────────────────────────────────────────────
  type InstructorVideo = { id: number; slug: string; name: string; youtubeUrl: string | null; order: number };

  const { data: instructorVideos = [] } = useQuery<InstructorVideo[]>({
    queryKey: ["/api/instructor-videos"],
  });

  const videosBySlug: Record<string, string | null> = Object.fromEntries(
    instructorVideos.map((v) => [v.slug, v.youtubeUrl])
  );

  // YouTube URL → embed URL 변환 (watch?v= / youtu.be / shorts / embed 모두 지원)
  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?&]+)/,
      /(?:youtube\.com\/embed\/)([^?&]+)/,
      /(?:youtube\.com\/shorts\/)([^?&]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    return url;
  };

  const instructors: { slug: string; name: string; role: string; image: string; credentials: string[] }[] = [
    {
      slug: "jeongwooseok",
      name: "정우석",
      role: "원장",
      image: "/images/정우석.jpg?v=2",
      credentials: [
        "캐나다 Bishop's University 학사 졸업",
        "(전) 해커스 인강 50만뷰+ 인기강사",
        "(전) 강남 영단기 1타강사",
        "TOEIC 990 만점강사",
      ],
    },
    {
      slug: "kimmyounggeun",
      name: "김명근",
      role: "강사",
      image: "/images/김명근.png?v=2",
      credentials: [
        "교육학 석사",
        "정교사 자격증 보유",
        "(전) K중학교 교사",
        "저서: 빈*순*삽 근의 문법공식",
      ],
    },
    {
      slug: "leehongseok",
      name: "이홍석",
      role: "강사",
      image: "/images/이홍석.png?v=2",
      credentials: [
        "서울대학교 학사 졸업",
        "97년 Mensa(멘사) 만점",
        "행정고시 1차 합격",
      ],
    },
    {
      slug: "haserin",
      name: "하세린",
      role: "강사",
      image: "/images/하세린.png?v=2",
      credentials: [
        "이화여대 학사 졸업",
        "영국 런던 LCF 저널리즘 석사",
        "Harvard 교류프로그램 오프닝",
        "목동·강남구청·서초 입시영어강의",
        "법률사무소 김&장 변호사 비즈니스영어 레슨",
      ],
    },
  ];

  // 메인 강의 프리뷰: 정우석(원장) 슬롯의 YouTube URL을 메인 영상으로 사용
  // — 관리자 페이지에서 "정우석" 영상 URL만 바꾸면 메인 프리뷰가 자동 갱신됨
  const mainPreviewEmbedUrl = getYouTubeEmbedUrl(videosBySlug["jeongwooseok"]);

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

            {/* ── 브랜드 감성 태그라인 (모든 슬라이드 상단 공통) ── */}
            <div className="mb-4 sm:mb-5">
              <p className="text-[11px] sm:text-xs font-semibold text-[#FF6B00] uppercase tracking-[0.25em] mb-1.5">
                시대영재 × 페이지원 영어학원
              </p>
              <p
                className="text-lg sm:text-2xl lg:text-3xl text-gray-800 leading-snug"
                style={{ fontFamily: '"Nanum Myeongjo", "Noto Serif KR", serif', fontWeight: 700, letterSpacing: '-0.01em' }}
              >
                오늘의 한 페이지가,
                <span className="hidden sm:inline"> </span>
                <br className="sm:hidden" />
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-orange-500"
                  style={{ fontFamily: '"Nanum Myeongjo", "Noto Serif KR", serif', fontWeight: 800 }}
                >
                  내일의 등급
                </span>
                을 결정합니다.
              </p>
            </div>

            {/* ── GIF 슬라이드 (gif 속성이 있는 슬라이드) ── */}
            {heroSlides[currentSlide].gif && (
              <div
                key={`gif-${currentSlide}`}
                className="fade-in cursor-pointer mb-5"
                onClick={currentSlide === 0 ? handleSpecialClick : undefined}
              >
                <img
                  src={heroSlides[currentSlide].gif!}
                  alt="시대영재 × 페이지원 영어학원 히어로 슬라이드"
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
              왜 시대영재 × 페이지원 영어학원인가?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              중고등부 입시영어에 특화된 차별화된 커리큘럼으로 확실한 성적 향상을 보장합니다.
            </p>
          </div>

          {/* 프로그램 카드 3개 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">

            {/* 중등부 */}
            <Card
              className={`border-2 transition-all duration-300 cursor-pointer ${expandedProgram === 'middle' ? 'border-primary shadow-lg bg-primary/5' : 'border-border/60 hover:border-primary/40 hover:shadow-md'}`}
              onClick={() => setExpandedProgram(expandedProgram === 'middle' ? null : 'middle')}
              data-testid="card-program-middle"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Medal className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">중등부 프로그램</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  탄탄한 문법 만들기와 정확하고 빠른 독해 습관 만들기로 고등학교 진학 완벽 준비
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>{expandedProgram === 'middle' ? '닫기' : '상세보기'}</span>
                  <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-300 ${expandedProgram === 'middle' ? 'rotate-180' : ''}`} />
                </div>
              </CardContent>
            </Card>

            {/* 고등부 */}
            <Card
              className={`border-2 transition-all duration-300 cursor-pointer ${expandedProgram === 'high' ? 'border-primary shadow-lg bg-primary/5' : 'border-border/60 hover:border-primary/40 hover:shadow-md'}`}
              onClick={() => setExpandedProgram(expandedProgram === 'high' ? null : 'high')}
              data-testid="card-program-high"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Laptop className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">고등부 프로그램</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  (일반고/특목고) 서술형 문제 정복과 SYNTAX구문독해로 대학입시 완벽 대비
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>{expandedProgram === 'high' ? '닫기' : '상세보기'}</span>
                  <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-300 ${expandedProgram === 'high' ? 'rotate-180' : ''}`} />
                </div>
              </CardContent>
            </Card>

            {/* 영재고 재학생 */}
            <Card
              className={`border-2 transition-all duration-300 cursor-pointer ${expandedProgram === 'gifted' ? 'border-primary shadow-lg bg-primary/5' : 'border-border/60 hover:border-primary/40 hover:shadow-md'}`}
              onClick={() => setExpandedProgram(expandedProgram === 'gifted' ? null : 'gifted')}
              data-testid="card-program-gifted"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">영재고 재학생 프로그램</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  광주 영재고 재학생을 위한 영어 전략 — 내신 1등급과 공인 성적 면제를 가장 빠른 경로로 해결합니다
                </p>
                <div className="flex items-center text-sm text-primary font-semibold">
                  <span>{expandedProgram === 'gifted' ? '닫기' : '상세보기'}</span>
                  <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-300 ${expandedProgram === 'gifted' ? 'rotate-180' : ''}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── 펼쳐지는 상세 내용 패널 ── */}
          {expandedProgram && (
            <div className="mt-6 rounded-2xl border border-primary/30 bg-background shadow-xl overflow-hidden">

              {/* ── 중등부 상세 ── */}
              {expandedProgram === 'middle' && (
                <div className="p-8 lg:p-12">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-foreground mb-2">중학교 영어 프로그램</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      중학교 시기는 영어 학습의 가장 중요한 기초를 다지는 시기입니다. 체계적인 문법 학습과 효과적인 독해 훈련을 통해 학생들의 영어 실력을 한 단계 끌어올립니다.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-4">프로그램 특징</h4>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="text-primary mt-1 font-bold">●</span><span><strong className="text-foreground">단계별 문법 완성:</strong> 중학교 필수 문법을 체계적으로 정리하여 고등학교 서술형까지 연결되는 탄탄한 기초 완성</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-1 font-bold">●</span><span><strong className="text-foreground">독해 실력 향상:</strong> 다양한 유형의 지문으로 독해 능력과 문제 해결 능력 배양</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-1 font-bold">●</span><span><strong className="text-foreground">어휘력 강화:</strong> 중학교 필수 어휘부터 고등학교 심화 어휘까지 체계적 학습</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-1 font-bold">●</span><span><strong className="text-foreground">내신 대비:</strong> 학교별 시험 유형 분석과 맞춤형 내신 대비</span></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-4">수업 방식</h4>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        반당 10명 미만 소수 정예 클래스로 수준별 수업 진행. <strong className="text-foreground">월수 / 화목</strong> 메인 수업 이후 매주 <strong className="text-foreground">금·토요일</strong>에 확인 학습을 실시합니다.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        듣기·모의고사 실전 문제풀이와 어휘 테스트를 병행하여, 고등학교 진학 후에도 확실한 성과를 이끌어냅니다.
                      </p>
                      <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        대상: 중학교 1~3학년
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-foreground mb-5">레벨별 커리큘럼</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { level: 'Alpha', badge: 'Lv.1', desc: '중학 필수 어휘 1,800개 습득 및 문법 기초 입문. 주어·동사 찾기와 기초 문장 구성 연습.' },
                      { level: 'Bravo', badge: 'Lv.2', desc: '핵심 문법 체화 및 독해 능력 배양. 중학 내신 수준 조건 영작 집중 훈련.' },
                      { level: 'Charlie', badge: 'Lv.3', desc: '복잡한 문장 구조 분석 및 논리적 독해. 고교 수행평가 연계 논술형 영작 연습.' },
                      { level: 'Delta', badge: 'Lv.4', desc: '고1~2 모의고사 기출 적응. 고등 내신형 서술형·통암기·지문 변형 영작 대비.' },
                      { level: 'Master', badge: 'Lv.5', desc: '수능 1등급(90점 이상) 안정적 확보. 고난도 독해와 에세이 라이팅 완성.' },
                    ].map(({ level, badge, desc }) => (
                      <div key={level} className="rounded-xl border border-border bg-muted/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{badge}</span>
                          <span className="font-bold text-foreground">{level}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 고등부 상세 ── */}
              {expandedProgram === 'high' && (
                <div className="p-8 lg:p-12">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-foreground mb-2">고등부 프로그램</h3>
                    <p className="text-muted-foreground italic leading-relaxed">
                      강남 1타의 압도적 강의력 × 시대영재 × 페이지원 데이터 센터의 치밀한 분석 — 고등 영어, 전략이 결과를 바꿉니다. 내신 1등급부터 수능 만점까지 최단 거리 커리큘럼을 제시합니다.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-4">COURSE 01</div>
                      <h4 className="text-lg font-bold text-foreground mb-1">고1~2 과정: 상위권 도약</h4>
                      <p className="text-xs text-muted-foreground mb-4">내신 1등급의 본질은 완벽한 기본기와 학교별 데이터의 결합입니다.</p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">고등 필수 구문·어법·독해 완성</strong> — 수능까지 관통하는 어법 체계 정립</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">내신 1등급 프로젝트</strong> — 인근 고교 최근 5개년 기출·부교재 변형 패턴 정밀 분석</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">수능·모의고사 연계 심화</strong> — 논리적 추론 능력 배양, 고등 영어 전체 지형 파악</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">킬러 문항 대비</strong> — 호흡이 긴 문장의 핵심을 빠르게 파악하는 상위권 전용 훈련</span></li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-4">COURSE 02</div>
                      <h4 className="text-lg font-bold text-foreground mb-1">고3 과정: 수능 1등급 최종 병기</h4>
                      <p className="text-xs text-muted-foreground mb-4">목표는 오직 하나, 흔들리지 않는 절대평가 1등급입니다.</p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">수능 영어 1등급 전략</strong> — 평가원 출제 의도 파악·오답 소거 독보적 풀이 노하우</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">연계·비연계 심화</strong> — EBS 핵심 지문 분석 + 비연계 지문 적응력 극대화</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">고급 구문·논리 독해</strong> — 추상·철학적 지문까지 문맥적 의미 완벽 파악</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 font-bold">▶</span><span><strong className="text-foreground">실전 모의 훈련</strong> — 시간 배분·멘탈 관리·취약 유형 보완으로 실전 근육 완성</span></li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-foreground mb-5">시대영재 × 페이지원만의 독보적 경쟁력</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { title: '검증된 강남 1타 직강', desc: '(전) 강남 영단기 전 타임 마감의 신화. 수만 명이 선택한 노하우로 대치동 현강 퀄리티를 그대로 전달합니다.' },
                      { title: '데이터 기반 내신 관리', desc: '학원 자체 데이터 센터에서 추출한 학교별 빈출 어휘·선호 지문·서술형 특징을 바탕으로 가장 효율적인 시험 대비를 진행합니다.' },
                      { title: '철저한 피드백 밀착 관리', desc: '매시간 성취도 평가와 개별 피드백으로 부족한 부분을 즉각 보완하는 책임 교육을 실천합니다.' },
                    ].map(({ title, desc }) => (
                      <div key={title} className="rounded-xl border border-border bg-muted/40 p-5">
                        <p className="font-bold text-foreground mb-2">{title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 영재고 재학생 상세 ── */}
              {expandedProgram === 'gifted' && (
                <div className="p-8 lg:p-12">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-foreground mb-2">영재고 재학생 프로그램</h3>
                    <p className="text-muted-foreground italic leading-relaxed mb-3">
                      강남 영단기 전 타임 마감의 신화, 광주 영재고 영어를 압도하다 — (전) 영단기 강남 현강 마감 / 해커스 50만+ 뷰의 정우석 원장 직강
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      영재고 학생들에게 영어는 단순한 교과목이 아닙니다. 수학과 과학에 몰입할 시간을 벌어주는 <strong className="text-foreground">전략적 도구</strong>여야 합니다. 불필요한 시행착오 없이, 가장 빠르고 확실하게 내신 1등급과 공인 성적 면제 조건을 동시에 해결합니다.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-4">COURSE 01</div>
                      <h4 className="text-lg font-bold text-foreground mb-1">950+ Master Class</h4>
                      <p className="text-xs text-muted-foreground mb-4">목표는 단순 점수가 아닌, '영어 자유권' 획득입니다.</p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="text-primary font-bold">●</span><span>대상: 교내 영어 과목 면제 조건을 조기에 충족하고, 대학 진학 및 글로벌 리더로서의 심화 학습을 원하는 학생</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary font-bold">●</span><span><strong className="text-foreground">면제 조건 조기 달성:</strong> 압도적 고득점으로 영어 과목 면제를 확정 지어 물리적 시간을 확보합니다.</span></li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-4">COURSE 02</div>
                      <h4 className="text-lg font-bold text-foreground mb-1">750+ Speed Pass Class</h4>
                      <p className="text-xs text-muted-foreground mb-4">가장 효율적인 경로로 졸업 요건을 끝냅니다.</p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="text-primary font-bold">●</span><span>대상: 기초 졸업 요건(공인 성적)을 최단기간에 충족하고자 하는 재학생 및 예비 합격생</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary font-bold">●</span><span><strong className="text-foreground">Targeting Logic:</strong> 영재고 학생들의 취약 유형을 분석, 단기에 점수를 끌어올립니다.</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary font-bold">●</span><span><strong className="text-foreground">Essential Grammar & Vocab:</strong> 수능·공인 영어의 핵심 접점을 찾아 학습량을 최소화하고 효율을 극대화합니다.</span></li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-foreground mb-5">시대영재 × 페이지원 영어학원만의 독보적 시스템</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { title: '학교별 맞춤 정밀 타격', desc: '광주 영재고 출제 경향을 완벽 분석한 자체 제작 교재. 학교별 내신 지문과 수능 변형 문제를 넘나드는 정독&스킬 강의로 실전 점수 향상을 보장합니다.' },
                      { title: '검증된 강남 1타 노하우', desc: '강남 해커스·영단기 등 메이저 학원에서 검증된 마감 강사의 강의력. 문제의 정답이 보이는 구조적 접근법을 전수합니다.' },
                      { title: 'AI 기반 데이터 관리', desc: '매 수업 실전 모의 테스트와 AI 기반 오답 분석으로 학생의 현재 위치를 객관적으로 진단하고 부족한 1%를 채워나갑니다.' },
                    ].map(({ title, desc }) => (
                      <div key={title} className="rounded-xl border border-border bg-muted/40 p-5">
                        <p className="font-bold text-foreground mb-2">{title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ABOUT SECTION — 강사진 4인 테이블 (한눈에 보이게)
      ═══════════════════════════════════════════ */}
      <section id="about" className="py-20 geometric-shapes">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">About</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Presentation className="mr-2 w-4 h-4" />
              시대영재 × 페이지원 · 강사진 소개
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-3">
              검증된 강사진
            </h2>
            <p
              className="text-lg md:text-xl text-primary/90 max-w-3xl mx-auto leading-relaxed mb-3"
              style={{ fontFamily: '"Nanum Myeongjo", "Noto Serif KR", serif', fontWeight: 700, letterSpacing: '-0.01em' }}
            >
              오늘의 한 페이지가, <span style={{ fontWeight: 800 }} className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-orange-500">내일의 등급</span>을 결정합니다.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              (전)강남영단기 1타강사 출신 캐나다국적 원장과 함께
              <br className="hidden md:block" />
              서울대·이화여대·교육학 석사 출신 강사진이 직접 지도합니다.
            </p>
          </div>

          {/* 좌측 강사 테이블 / 우측 대표 강의 프리뷰 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 max-w-7xl mx-auto items-start">
            {/* 좌측: 강사진 테이블 (4 rows, 간격 좁힘) */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border/40 overflow-hidden">
                {/* Header row (desktop only) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-muted/60 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <div className="col-span-4">강사</div>
                  <div className="col-span-8">약력 · 경력</div>
                </div>

                {instructors.map((ins, idx) => {
                  const isLast = idx === instructors.length - 1;
                  return (
                    <div
                      key={ins.slug}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-2.5 items-center ${isLast ? "" : "border-b border-border"}`}
                      data-testid={`row-instructor-${ins.slug}`}
                    >
                      {/* Photo + Name */}
                      <div className="md:col-span-4 flex flex-col items-center text-center">
                        <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-orange-100 dark:border-orange-900/30 bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/10 dark:to-card">
                          <img
                            src={ins.image}
                            alt={`${ins.name} ${ins.role}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="font-bold text-foreground text-base mt-2">{ins.name}</h3>
                      </div>

                      {/* Credentials */}
                      <div className="md:col-span-8">
                        <ul className="space-y-1.5 text-sm text-foreground/90">
                          {ins.credentials.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                              <span className="leading-snug">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 우측: 대표 강의 프리뷰 (sticky) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="text-center lg:text-left mb-4">
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Preview</p>
                  <h3 className="text-2xl lg:text-3xl font-black text-foreground">대표 강의 프리뷰</h3>
                </div>
                {mainPreviewEmbedUrl ? (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-border/40">
                    <iframe
                      src={mainPreviewEmbedUrl}
                      className="w-full h-full"
                      loading="lazy"
                      title="시대영재 × 페이지원 영어학원 대표 강의 프리뷰"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground border border-dashed border-border">
                    <div className="text-center px-4">
                      <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">강의 영상 준비 중</p>
                      <p className="text-xs mt-1 opacity-70">관리자 페이지에서 "정우석" 슬롯에 YouTube URL을 등록하면 표시됩니다.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd_c2YdUxewRPDwW3I6FAnngfEVysh5oYu8CwctR14ne5RnBg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-7 py-3.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-105"
              data-testid="button-about-apply"
            >
              <NotebookPen className="mr-2 w-5 h-5" />
              레벨테스트 / 입학대기 신청
            </a>
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
              시대영재 × 페이지원 영어학원의 교육 환경과 수업 현장을 확인해보세요.
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
              시대영재 × 페이지원 영어학원에서 실제로 성과를 얻은 수강생들의 생생한 후기를 확인해보세요.
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
                  src={`https://maps.google.com/maps?width=600&height=400&hl=ko&q=${encodeURIComponent('광주광역시 남구 봉선중앙로16 시대영재 페이지원 영어학원')}&ie=UTF8&t=&z=17&iwloc=B&output=embed`}
                  width="100%"
                  height="400"
                  style={{border: 0, borderRadius: '16px'}}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="shadow-lg"
                  title="시대영재 × 페이지원 영어학원 위치"
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
                <div className="flex items-center gap-2 sm:gap-3">
                  <img
                    src="/images/pageone-logo-v2.png"
                    alt="페이지원 영어학원"
                    className="h-9 sm:h-10 w-auto object-contain"
                  />
                  <span className="text-lg font-black text-secondary-foreground/60 select-none" aria-hidden="true">×</span>
                  <img
                    src="/images/logo-footer.png"
                    alt="시대영재 학원"
                    className="h-8 sm:h-9 w-auto object-contain"
                  />
                </div>
                <p className="text-sm text-secondary-foreground/70 mt-2">광주광역시 남구 봉선중앙로16, 2층</p>
              </div>
              <p
                className="text-base md:text-lg text-primary/90 mb-2 leading-relaxed"
                style={{ fontFamily: '"Nanum Myeongjo", "Noto Serif KR", serif', fontWeight: 700, letterSpacing: '-0.01em' }}
              >
                오늘의 한 페이지가, <span style={{ fontWeight: 800 }} className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-orange-500">내일의 등급</span>을 결정합니다.
              </p>
              <p className="text-secondary-foreground/75 mb-4 leading-relaxed">
                실력 있는 강사가 실력 있는 학생을 만든다는 믿음, 시대영재 × 페이지원의 시작입니다.
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
              <p>&copy; 2026 시대영재 × 페이지원 영어학원. All rights reserved.</p>
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
