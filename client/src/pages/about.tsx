import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Calendar,
  Play,
  Award,
  GraduationCap,
  BookOpen,
  Sparkles,
  Star,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

/* -----------------------------------------------------------
   강사진 정적 데이터
   - 이름/약력/사진은 코드에 고정 (자주 안 바뀌므로)
   - 유튜브 링크는 DB(instructor_videos)에서 가져옴 → 관리자가 편집
   ----------------------------------------------------------- */
type InstructorMeta = {
  slug: string;
  name: string;
  title: string;
  photo: string;
  photoAlt: string;
  badges: string[];
  credentials: string[];
  accent: string;        // tailwind color shorthand
  featured?: boolean;    // 원장 카드 강조
};

const INSTRUCTORS: InstructorMeta[] = [
  {
    slug: "jeongwooseok",
    name: "정우석",
    title: "원장 · 대표강사",
    photo: "/images/정우석.jpg",
    photoAlt: "시대영재학원 원장 정우석 프로필",
    badges: ["원장", "TOEIC 990 만점강사"],
    credentials: [
      "캐나다 Bishop's University 학사 졸업",
      "(전) 해커스 인강 50만뷰+ 인기강사",
      "(전) 강남 영단기 1타 강사",
      "TOEIC 990 만점강사",
    ],
    accent: "amber",
    featured: true,
  },
  {
    slug: "kimmyounggeun",
    name: "김명근",
    title: "문법 · 내신 전임",
    photo: "/images/김명근.png",
    photoAlt: "시대영재학원 강사 김명근 프로필",
    badges: ["교육학 석사", "정교사 자격증"],
    credentials: [
      "교육학 석사",
      "정교사 자격증 보유",
      "(전) K중학교 교사",
      "저서: 빈ㆍ순ㆍ삽 근의 문법공식",
    ],
    accent: "blue",
  },
  {
    slug: "leehongseok",
    name: "이홍석",
    title: "독해 · 논리 전임",
    photo: "/images/이홍석.png",
    photoAlt: "시대영재학원 강사 이홍석 프로필",
    badges: ["서울대 학사", "MENSA 만점"],
    credentials: [
      "서울대학교 학사 졸업",
      "97년 Mensa(멘사) 만점",
      "행정고시 1차 합격",
    ],
    accent: "emerald",
  },
  {
    slug: "haserin",
    name: "하세린",
    title: "회화 · 비즈니스 영어",
    photo: "/images/하세린.png",
    photoAlt: "시대영재학원 강사 하세린 프로필",
    badges: ["이화여대 학사", "런던 LCF 석사"],
    credentials: [
      "이화여대 학사 졸업",
      "영국 런던 LCF 저널리즘 석사",
      "Harvard 대학 교류프로그램 오프닝",
      "목동·강남구청·서초 입시영어 강의",
      "법률사무소 김&장 변호사 비즈니스영어 레슨",
    ],
    accent: "rose",
  },
];

/* -----------------------------------------------------------
   YouTube URL → embed URL 변환 (자동 재생 안 함)
   ----------------------------------------------------------- */
function toEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!url) return null;

  // youtu.be/<id>
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  // youtube.com/watch?v=<id>
  if (url.includes("youtube.com/watch")) {
    try {
      const u = new URL(url);
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    } catch {
      return null;
    }
  }
  // 이미 embed URL이면 그대로
  if (url.includes("/embed/")) return url;
  // youtube.com/shorts/<id>
  if (url.includes("youtube.com/shorts/")) {
    const id = url.split("/shorts/")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  return null;
}

/* -----------------------------------------------------------
   YouTube ID 추출 → 썸네일 표시용
   ----------------------------------------------------------- */
function extractYoutubeId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.includes("youtu.be/")) return raw.split("youtu.be/")[1]?.split(/[?&]/)[0] || null;
  if (raw.includes("/embed/")) return raw.split("/embed/")[1]?.split(/[?&]/)[0] || null;
  if (raw.includes("/shorts/")) return raw.split("/shorts/")[1]?.split(/[?&]/)[0] || null;
  if (raw.includes("youtube.com/watch")) {
    try {
      return new URL(raw).searchParams.get("v");
    } catch {
      return null;
    }
  }
  return null;
}

interface InstructorVideo {
  id: string;
  slug: string;
  name: string;
  youtubeUrl: string | null;
}

/* -----------------------------------------------------------
   인라인 강의 프리뷰 플레이어 (썸네일 → 클릭 시 iframe 로드)
   ----------------------------------------------------------- */
function PreviewPlayer({ url, instructorName }: { url: string | null; instructorName: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = useMemo(() => toEmbedUrl(url), [url]);
  const ytId = useMemo(() => extractYoutubeId(url), [url]);

  if (!embed) {
    return (
      <div className="relative w-full aspect-video rounded-xl bg-muted/60 border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground">
        <Play className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">강의 프리뷰 영상 준비 중</p>
      </div>
    );
  }

  if (!playing) {
    // 썸네일 + 플레이 버튼 (페이지 로드 시 iframe 안 띄움 → 성능 ↑)
    const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/40"
        aria-label={`${instructorName} 강의 프리뷰 재생`}
        data-testid={`preview-thumb-${instructorName}`}
      >
        {thumb && (
          <img
            src={thumb}
            alt={`${instructorName} 강의 프리뷰 썸네일`}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/95 shadow-2xl flex items-center justify-center group-hover:scale-110 transition">
            <Play className="w-9 h-9 text-primary fill-primary ml-1" />
          </div>
        </div>
        <div className="absolute bottom-3 left-4 right-4 text-white text-sm font-medium drop-shadow">
          ▶ {instructorName} 강의 프리뷰
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
      <iframe
        src={`${embed}?autoplay=1&rel=0`}
        title={`${instructorName} 강의 프리뷰`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        data-testid={`preview-player-${instructorName}`}
      />
    </div>
  );
}

/* -----------------------------------------------------------
   강사 카드 (1명)
   ----------------------------------------------------------- */
function InstructorCard({
  meta,
  videoUrl,
}: {
  meta: InstructorMeta;
  videoUrl: string | null;
}) {
  // accent → tailwind 동적 클래스 매핑 (Tailwind는 동적 클래스 못 잡으므로 정적 매핑)
  const accentMap: Record<string, { ring: string; chip: string; halo: string; icon: string }> = {
    amber:   { ring: "ring-amber-400/40",   chip: "bg-amber-100 text-amber-800",   halo: "from-amber-200/40",   icon: "text-amber-600" },
    blue:    { ring: "ring-blue-400/40",    chip: "bg-blue-100 text-blue-800",     halo: "from-blue-200/40",    icon: "text-blue-600" },
    emerald: { ring: "ring-emerald-400/40", chip: "bg-emerald-100 text-emerald-800", halo: "from-emerald-200/40", icon: "text-emerald-600" },
    rose:    { ring: "ring-rose-400/40",    chip: "bg-rose-100 text-rose-800",     halo: "from-rose-200/40",    icon: "text-rose-600" },
  };
  const c = accentMap[meta.accent] || accentMap.blue;

  return (
    <Card
      className={`overflow-hidden border-0 shadow-xl ring-1 ${c.ring} bg-white/95 dark:bg-card`}
      data-testid={`instructor-card-${meta.slug}`}
    >
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* 좌측: 사진 + 이름 */}
          <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 p-6 lg:p-10 flex flex-col items-center justify-center">
            {/* 데코 후광 */}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${c.halo} to-transparent opacity-60`} />

            <div className="relative">
              <div className="w-56 h-72 lg:w-64 lg:h-80 rounded-2xl overflow-hidden bg-white shadow-xl ring-4 ring-white">
                <img
                  src={meta.photo}
                  alt={meta.photoAlt}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  data-testid={`instructor-photo-${meta.slug}`}
                />
              </div>
              {meta.featured && (
                <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-950 rounded-full px-3 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> 원장
                </div>
              )}
            </div>

            <div className="mt-6 text-center relative">
              <p className="text-sm text-muted-foreground mb-1">{meta.title}</p>
              <h3
                className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground"
                data-testid={`instructor-name-${meta.slug}`}
              >
                {meta.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {meta.badges.map((b) => (
                  <Badge key={b} variant="secondary" className={`${c.chip} font-medium border-0`}>
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 우측: 약력 + 프리뷰 영상 */}
          <div className="p-6 lg:p-10 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4 text-foreground">
                <Award className={`w-5 h-5 ${c.icon}`} />
                <h4 className="text-lg font-semibold">주요 경력 · 자격</h4>
              </div>
              <ul className="space-y-2.5">
                {meta.credentials.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm lg:text-base text-foreground/90 leading-relaxed"
                  >
                    <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-current ${c.icon}`} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3 text-foreground">
                <Play className={`w-5 h-5 ${c.icon}`} />
                <h4 className="text-lg font-semibold">강의 프리뷰</h4>
              </div>
              <PreviewPlayer url={videoUrl} instructorName={meta.name} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -----------------------------------------------------------
   About 페이지 본문
   ----------------------------------------------------------- */
export default function About() {
  useSEO({
    title: "봉선동 영어학원 시대영재학원 — 강사진 소개",
    description:
      "시대영재학원 강사진 소개 — 정우석 원장(강남영단기 1타·해커스 50만뷰), 김명근(교육학 석사), 이홍석(서울대·MENSA 만점), 하세린(이화여대·런던 LCF 석사). 광주 봉선동 영어학원.",
    ogUrl: "https://www.sidae-edu.com/about",
  });

  // 관리자 페이지에서 편집하는 유튜브 링크
  const { data: videos } = useQuery<InstructorVideo[]>({
    queryKey: ["instructor-videos"],
    queryFn: async () => {
      const res = await fetch("/api/instructor-videos");
      if (!res.ok) throw new Error("Failed to load instructor videos");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const videoBySlug = useMemo(() => {
    const map = new Map<string, string | null>();
    (videos || []).forEach((v) => map.set(v.slug, v.youtubeUrl));
    return map;
  }, [videos]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="hero-gradient text-white py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center fade-in">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
              <Sparkles className="mr-2 w-4 h-4" />
              시대영재학원 강사진
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              검증된 강사진의 <br className="hidden lg:block" />
              <span className="text-amber-300">차원이 다른 영어 교육</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-200 leading-relaxed mb-8">
              명문대 졸업 · 대형 학원 1타 출신 · 만점 보유자가 직접 가르치는<br />
              광주 봉선동 입시영어 전문 학원
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold"
                data-testid="button-consultation"
              >
                <Calendar className="mr-2 w-5 h-5" />
                상담 예약하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 bg-white/10 text-white border-white/40 hover:bg-white/20"
                onClick={() =>
                  document
                    .getElementById("instructors")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                data-testid="button-meet-instructors"
              >
                <BookOpen className="mr-2 w-5 h-5" />
                강사진 만나보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 강사진 섹션 */}
      <section id="instructors" className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4" />
              Faculty
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              학생을 합격으로 이끄는 4인의 전문가
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              각자의 분야에서 정점에 오른 강사진이 학생 한 명 한 명을 직접 책임집니다.
            </p>
          </div>

          <div className="space-y-10 lg:space-y-14 max-w-6xl mx-auto">
            {INSTRUCTORS.map((meta) => (
              <InstructorCard
                key={meta.slug}
                meta={meta}
                videoUrl={videoBySlug.get(meta.slug) ?? null}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              시대영재학원과 함께 시작하세요
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              상담은 무료로 진행되며, 학생의 현재 수준에 맞춘 학습 플랜을 제안해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" data-testid="button-start-learning">
                <BookOpen className="mr-2 w-5 h-5" />
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
