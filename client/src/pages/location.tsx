/**
 * /location — 봉선동 영어학원 네이버 지역 SEO 전용 랜딩 페이지
 * 시대영재학원 (sidae-edu.com)
 *
 * 목적: 네이버 "봉선동 영어학원" 지역 검색 상위 노출
 *  - H1 / 주소 / tel 링크 / 네이버 지도 iframe
 *  - 주변 랜드마크 본문 노출 (봉선중 · 봉선고 · 주요 아파트 단지)
 *  - schema.org/EducationalOrganization JSON-LD 구조화 데이터
 */

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation, Train, Bus } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

// ───── 학원 고정 정보 ─────
const ACADEMY = {
  name: "시대영재학원",
  alternateName: "봉선동 영어학원 시대영재학원",
  // 도로명 + 상세주소 (시/도 포함 정규화 형태)
  streetAddress: "봉선중앙로 16, 2층",
  addressLocality: "광주광역시 남구",
  fullAddress: "광주광역시 남구 봉선중앙로 16, 2층 시대영재학원",
  telephone: "062-462-0990",
  telephoneAlt: "062-456-0990",
  url: "https://www.sidae-edu.com/location",
  siteUrl: "https://www.sidae-edu.com",
  // openingHours (schema.org ISO-8601 형식)
  openingHoursSpec: [
    { days: "Mo,Tu,We,Th,Fr", opens: "14:00", closes: "22:00" },
    { days: "Sa,Su", opens: "09:30", closes: "18:00" },
  ],
  // 평일 안내용 표기
  openingHoursHuman: {
    weekday: "월-금 14:00 - 22:00",
    weekend: "토-일 09:30 - 18:00",
  },
};

export default function Location() {
  // ───── SEO 메타태그 ─────
  useSEO({
    title: "봉선동 영어학원 시대영재학원 — 오시는 길 · 위치 · 약도",
    description:
      "봉선동 영어학원 시대영재학원 오시는 길. 광주광역시 남구 봉선중앙로 16, 2층. 봉선중·봉선고 근방, 봉선동 아파트 단지에서 도보 가능. 전화 062-462-0990.",
    keywords:
      "봉선동 영어학원, 봉선동 학원, 봉선동 영어, 시대영재학원 오시는 길, 시대영재학원 위치, 광주 남구 영어학원, 봉선중 근처 영어학원, 봉선고 근처 영어학원, 봉선동 영어 과외, 봉선동 수능영어",
    ogTitle: "봉선동 영어학원 시대영재학원 — 오시는 길",
    ogDescription:
      "광주광역시 남구 봉선중앙로 16, 2층. 봉선중학교·봉선고등학교 인근. 전화 062-462-0990.",
    ogUrl: ACADEMY.url,
  });

  // ───── JSON-LD (schema.org/EducationalOrganization) ─────
  useEffect(() => {
    const SCRIPT_ID = "jsonld-educationalorganization-location";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: ACADEMY.name,
      alternateName: ACADEMY.alternateName,
      url: ACADEMY.siteUrl,
      telephone: ACADEMY.telephone,
      // 복수 전화번호를 contactPoint 로도 노출
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: ACADEMY.telephone,
          contactType: "customer service",
          areaServed: "KR",
          availableLanguage: ["Korean", "English"],
        },
        {
          "@type": "ContactPoint",
          telephone: ACADEMY.telephoneAlt,
          contactType: "customer service",
          areaServed: "KR",
          availableLanguage: ["Korean"],
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: ACADEMY.streetAddress,
        addressLocality: ACADEMY.addressLocality,
        addressRegion: "광주광역시",
        postalCode: "61640",
        addressCountry: "KR",
      },
      areaServed: {
        "@type": "Place",
        name: "광주광역시 남구 봉선동",
      },
      openingHoursSpecification: ACADEMY.openingHoursSpec.map((spec) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: spec.days
          .split(",")
          .map((d) => {
            const map: Record<string, string> = {
              Mo: "Monday",
              Tu: "Tuesday",
              We: "Wednesday",
              Th: "Thursday",
              Fr: "Friday",
              Sa: "Saturday",
              Su: "Sunday",
            };
            return map[d];
          })
          .filter(Boolean),
        opens: spec.opens,
        closes: spec.closes,
      })),
      sameAs: [ACADEMY.siteUrl],
    };

    // 기존 스크립트 제거 후 새로 주입 (페이지 재방문 시 중복 방지)
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // canonical 링크 설정
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = ACADEMY.url;

    return () => {
      const el = document.getElementById(SCRIPT_ID);
      if (el) el.remove();
    };
  }, []);

  // 네이버 지도 iframe src
  //  - 네이버 지도는 X-Frame-Options 제약이 있어, 검색 URL 방식을 사용합니다.
  //  - 정확한 "플레이스" 임베드가 필요하면 네이버 지도에서 본 학원 플레이스 ID를 받아
  //    src 를 https://map.naver.com/p/entry/place/{PLACE_ID} 로 교체하면 됩니다.
  const naverMapQuery = encodeURIComponent(
    "광주광역시 남구 봉선중앙로 16 시대영재학원"
  );
  const naverMapIframeSrc = `https://map.naver.com/p/search/${naverMapQuery}`;
  const naverMapViewUrl = `https://map.naver.com/p/search/${naverMapQuery}`;

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════
          HERO — H1
      ═══════════════════════════════════════════ */}
      <section className="hero-gradient text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
            <MapPin className="mr-2 w-4 h-4" />
            오시는 길 · Location
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6"
            data-testid="heading-location"
          >
            봉선동 영어학원 시대영재학원 — 오시는 길
          </h1>
          <p className="text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            광주광역시 남구 봉선동 중심, 봉선중학교·봉선고등학교 인근에
            위치한 중·고등부 내신 수능 영어 전문 학원입니다.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ADDRESS · TEL · HOURS
      ═══════════════════════════════════════════ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {/* 주소 */}
            <Card className="card-hover" data-testid="card-address">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-2">학원 주소</h2>
                <address className="not-italic text-muted-foreground leading-relaxed">
                  광주광역시 남구
                  <br />
                  봉선중앙로 16, 2층
                  <br />
                  <span className="font-semibold text-foreground">
                    시대영재학원
                  </span>
                </address>
              </CardContent>
            </Card>

            {/* 전화 — tel: 링크 */}
            <Card className="card-hover" data-testid="card-phone">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-2">전화 상담</h2>
                <p className="text-muted-foreground mb-3 text-sm">
                  클릭 시 바로 통화 연결
                </p>
                <div className="space-y-2">
                  <a
                    href={`tel:${ACADEMY.telephone}`}
                    className="block text-primary font-semibold text-lg hover:underline"
                    data-testid="link-tel-main"
                  >
                    {ACADEMY.telephone}
                  </a>
                  <a
                    href={`tel:${ACADEMY.telephoneAlt}`}
                    className="block text-primary font-semibold text-lg hover:underline"
                    data-testid="link-tel-alt"
                  >
                    {ACADEMY.telephoneAlt}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* 운영시간 */}
            <Card className="card-hover" data-testid="card-hours">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold mb-2">운영 시간</h2>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>평일: {ACADEMY.openingHoursHuman.weekday}</li>
                  <li>주말: {ACADEMY.openingHoursHuman.weekend}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          NAVER MAP IFRAME
      ═══════════════════════════════════════════ */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-center">
            네이버 지도에서 위치 확인
          </h2>

          <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-border">
            <iframe
              src={naverMapIframeSrc}
              title="봉선동 영어학원 시대영재학원 네이버 지도"
              width="100%"
              height="480"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              data-testid="iframe-naver-map"
            />
          </div>

          <div className="text-center mt-6">
            <Button asChild size="lg" data-testid="button-naver-open">
              <a
                href={naverMapViewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="mr-2 w-5 h-5" />
                네이버 지도 앱에서 열기
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LANDMARKS · 본문 텍스트 (네이버 크롤러 지역 연관성)
      ═══════════════════════════════════════════ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-center">
            봉선동 한복판, 어디서 와도 가까운 위치
          </h2>

          <div className="prose prose-lg max-w-none text-foreground space-y-6 leading-relaxed">
            <p data-testid="text-landmark-intro">
              <strong>시대영재학원</strong>은 <strong>광주광역시 남구 봉선동</strong>의
              교육 중심지인 봉선중앙로에 자리 잡은 <strong>봉선동 영어학원</strong>입니다.
              광주 남구 봉선동 일대의 중·고등학생 내신·수능 영어 교육을 전문으로
              하며, 도보·차량·대중교통 모두 접근이 편리한 위치에 있습니다.
            </p>

            <div className="grid md:grid-cols-2 gap-6 not-prose">
              <Card data-testid="card-landmark-schools">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">인근 학교</h3>
                  </div>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>· 봉선중학교 도보 이동 가능 거리</li>
                    <li>· 봉선고등학교 인근</li>
                    <li>· 설월여자고등학교 근방</li>
                    <li>· 광주동성고등학교 · 광주동성여자고등학교 통학권</li>
                    <li>· 무학초등학교 · 봉선초등학교 학부모 접근 용이</li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="card-landmark-apartments">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">인근 아파트 단지</h3>
                  </div>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>· 봉선2차 한국아델리움</li>
                    <li>· 봉선3차 한국아델리움</li>
                    <li>· 봉선 제일풍경채 엘리트파크</li>
                    <li>· 포스코 더샵 봉선</li>
                    <li>· 쌍용 스윗닷홈 · 금호타운 · 남양휴튼</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <p data-testid="text-landmark-traffic">
              <strong>봉선동</strong>은 광주 남구의 대표 학군 지역으로,
              <strong> 봉선중학교</strong>, <strong>봉선고등학교</strong>, 설월여자
              고등학교, 광주동성고등학교, 광주동성여자고등학교 등 주요
              중·고등학교가 모여 있습니다. 봉선 한국아델리움, 봉선 제일풍경채,
              포스코 더샵 봉선, 금호타운 등 <strong>봉선동 주요 아파트 단지</strong>
              에서 모두 도보 10분 이내 접근이 가능하여, 봉선동 거주 중학생·
              고등학생이 편리하게 다닐 수 있는 <strong>봉선동 영어학원</strong>입니다.
            </p>

            <div className="grid md:grid-cols-2 gap-4 not-prose">
              <div className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border">
                <Bus className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">대중교통</h4>
                  <p className="text-sm text-muted-foreground">
                    봉선중앙로 · 남문로 경유 시내버스 다수 노선 정차
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border">
                <Train className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">자차 이용</h4>
                  <p className="text-sm text-muted-foreground">
                    봉선중앙로 16 입력 후 내비게이션 안내 이용
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            상담은 전화 한 통이면 충분합니다
          </h2>
          <p className="text-muted-foreground mb-8">
            봉선동 영어학원 시대영재학원은 학생 한 명 한 명의 실력을 책임집니다.
            지금 바로 문의해 보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" data-testid="button-cta-tel-main">
              <a href={`tel:${ACADEMY.telephone}`}>
                <Phone className="mr-2 w-5 h-5" />
                {ACADEMY.telephone} 전화 걸기
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-testid="button-cta-tel-alt"
            >
              <a href={`tel:${ACADEMY.telephoneAlt}`}>
                <Phone className="mr-2 w-5 h-5" />
                {ACADEMY.telephoneAlt} 전화 걸기
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
