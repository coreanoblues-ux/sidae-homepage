import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 랜딩 페이지 상단에 뜨는 관리자 팝업.
 * - /api/popups 에서 활성 팝업 목록을 받아 여러 개를 동시 표시
 * - 각 팝업마다 "오늘 하루 안 보기" 옵션 (localStorage 24h)
 * - 팝업 내용이 바뀌면 (updatedAt 변경) 감춤 상태 리셋
 *
 * 관리자 페이지는 /admin-dashboard 의 "팝업 관리" 탭에서 생성·수정·활성화 가능.
 */

interface Popup {
  id: string;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  isActive: boolean;
  order: number;
  updatedAt?: string;
}

const STORAGE_KEY = "sidae:hidden-popups";

type HiddenMap = Record<string, { until: number; sig: string }>;

function readHidden(): HiddenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as HiddenMap;
  } catch {
    return {};
  }
}

function writeHidden(map: HiddenMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 저장 실패는 조용히 무시 (프라이빗 모드 등)
  }
}

function popupSig(p: Popup): string {
  // updatedAt 이 없으면 id 만으로 판단
  return p.updatedAt ? `${p.id}:${p.updatedAt}` : p.id;
}

export function PopupOverlay() {
  // ⚠️ 전역 queryClient 는 staleTime: Infinity 라서
  //   관리자가 팝업을 추가/수정해도 방문자가 하드 리프레시 하지 않으면 반영되지 않는다.
  //   → 이 쿼리만 refetch 정책을 짧게 잡고, 마운트마다 서버에서 가져온다.
  const { data: popups = [], error } = useQuery<Popup[]>({
    queryKey: ["/api/popups"],
    staleTime: 30 * 1000,          // 30초까지만 신선
    gcTime: 60 * 1000,             // 캐시 1분 후 폐기
    refetchOnMount: "always",       // 페이지 진입 시 항상 재요청
    refetchOnWindowFocus: true,     // 탭 재활성화 시 재요청
    refetchInterval: 60 * 1000,     // 페이지 열려있는 동안 1분마다 재확인
    retry: 1,
  });

  if (error) {
    // 개발용 로그 — 배포 콘솔에서도 원인 파악 가능
    // eslint-disable-next-line no-console
    console.warn("[PopupOverlay] /api/popups 로드 실패:", error);
  }

  // 표시 대상 팝업 ID 목록 (localStorage 기반 감춤 처리 이후)
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  useEffect(() => {
    if (!Array.isArray(popups) || popups.length === 0) {
      setVisibleIds([]);
      return;
    }

    const hidden = readHidden();
    const now = Date.now();
    let mutated = false;

    // 만료된 항목 정리
    for (const key of Object.keys(hidden)) {
      if (!hidden[key] || hidden[key].until < now) {
        delete hidden[key];
        mutated = true;
      }
    }

    // 실제 노출 대상 결정
    const visible: string[] = [];
    for (const p of popups) {
      const sig = popupSig(p);
      const rec = hidden[p.id];
      // 감춤 기록이 있고 아직 만료 전이고, 내용도 그대로면 감춤 유지
      if (rec && rec.until > now && rec.sig === sig) continue;
      // 내용이 바뀌었으면 감춤 기록 무효화
      if (rec && rec.sig !== sig) {
        delete hidden[p.id];
        mutated = true;
      }
      visible.push(p.id);
    }

    if (mutated) writeHidden(hidden);
    setVisibleIds(visible);
  }, [popups]);

  const closeOnce = (id: string) => {
    setVisibleIds((prev) => prev.filter((x) => x !== id));
  };

  const hideForToday = (p: Popup) => {
    const hidden = readHidden();
    hidden[p.id] = {
      until: Date.now() + 24 * 60 * 60 * 1000, // 24 시간
      sig: popupSig(p),
    };
    writeHidden(hidden);
    closeOnce(p.id);
  };

  const shown = popups.filter((p) => visibleIds.includes(p.id));
  if (shown.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none flex items-start justify-start pt-16 sm:pt-20 pl-4 sm:pl-6 lg:pl-8 pr-4"
      data-testid="popup-overlay"
    >
      <div className="flex flex-col gap-4 w-full max-w-md">
        {shown.map((p) => (
          <div
            key={p.id}
            className="popup-card-enter pointer-events-auto bg-background border border-border shadow-2xl rounded-lg overflow-hidden"
            data-testid={`popup-card-${p.id}`}
            role="dialog"
            aria-labelledby={`popup-title-${p.id}`}
          >
            {p.imageUrl && (
              <div className="w-full bg-muted flex items-center justify-center">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="px-3 py-2">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3
                  id={`popup-title-${p.id}`}
                  className="text-base font-bold text-foreground flex-1 leading-tight"
                  data-testid={`popup-title-${p.id}`}
                >
                  {p.title}
                </h3>
                <button
                  onClick={() => closeOnce(p.id)}
                  className="text-muted-foreground hover:text-foreground p-0.5 -m-0.5 rounded"
                  aria-label="닫기"
                  data-testid={`popup-close-${p.id}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {p.content && (
                <p className="text-xs text-muted-foreground whitespace-pre-wrap mb-2 leading-snug">
                  {p.content}
                </p>
              )}
              {p.linkUrl && (
                <div className="mb-2">
                  <Button
                    asChild
                    size="sm"
                    className="w-full h-8 text-sm"
                    data-testid={`popup-link-${p.id}`}
                  >
                    <a
                      href={p.linkUrl}
                      target={/^https?:\/\//i.test(p.linkUrl) ? "_blank" : undefined}
                      rel={/^https?:\/\//i.test(p.linkUrl) ? "noreferrer" : undefined}
                    >
                      {p.linkLabel || "신청하기"}
                    </a>
                  </Button>
                </div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-border/60">
                <button
                  onClick={() => hideForToday(p)}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  data-testid={`popup-hide-today-${p.id}`}
                >
                  오늘 하루 안 보기
                </button>
                <button
                  onClick={() => closeOnce(p.id)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  data-testid={`popup-close-text-${p.id}`}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopupOverlay;
