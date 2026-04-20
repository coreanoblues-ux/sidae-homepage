/**
 * useSEO - 네이버/구글 검색 최적화를 위한 동적 메타태그 훅
 * 시대영재학원 (sidae-edu.com)
 */

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
}

const DEFAULT_OG_IMAGE = "https://www.sidae-edu.com/images/og-image.png";
const DEFAULT_KEYWORDS =
  "봉선동 영어학원, 광주 영어학원, 시대영재학원, 봉선동 수능영어, 봉선동 고등영어, 남구 영어학원, 봉선동 영어, 광주 남구 영어학원";

export function useSEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
}: SEOProps) {
  // title
  document.title = title;

  // description
  setMeta("name", "description", description);

  // keywords
  setMeta("name", "keywords", keywords ?? DEFAULT_KEYWORDS);

  // 네이버 지역 정보
  setMeta("name", "geo.region", "KR-29");
  setMeta("name", "geo.placename", "광주광역시 남구 봉선동");

  // Open Graph
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", ogTitle ?? title);
  setMeta("property", "og:description", ogDescription ?? description);
  setMeta("property", "og:image", ogImage ?? DEFAULT_OG_IMAGE);
  setMeta("property", "og:url", ogUrl ?? window.location.href);
  setMeta("property", "og:site_name", "시대영재학원");
  setMeta("property", "og:locale", "ko_KR");
}

function setMeta(attrName: string, attrValue: string, content: string) {
  let el = document.querySelector(
    `meta[${attrName}="${attrValue}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
