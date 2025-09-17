import { useQuery } from "@tanstack/react-query";
import { Gallery } from "@/components/shared/Gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image, Users, Building } from "lucide-react";

export default function GalleryPage() {
  // 데이터베이스에서 갤러리 이미지 불러오기 (visible=true인 것만)
  const { data: galleryImages = [], isLoading, error } = useQuery({
    queryKey: ['/api/gallery'],
  });

  // 표시할 이미지들만 필터링 (visible이 true인 것들)
  const visibleImages = (galleryImages as any[]).filter(img => img.visible);
  
  // 카테고리별로 분류 (caption으로 구분하거나 전체를 하나로 표시)
  const allImages = visibleImages.map((img: any) => img.url);
  
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">갤러리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">갤러리를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              학원 갤러리
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              시대영재 학원의 교육 환경과 수업 현장을 확인해보세요.
              원장님의 모습과 학원의 시설, 수업 분위기를 생생하게 만나보실 수 있습니다.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground">원장 & 강의</h3>
                <p className="text-sm text-muted-foreground">시대영재 학원 원장의 강의 모습</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground">수업 현장</h3>
                <p className="text-sm text-muted-foreground">실제 수업 진행 모습</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-foreground">학원 시설</h3>
                <p className="text-sm text-muted-foreground">현대적인 교육 환경</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Images Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">전체 갤러리</h2>
            <p className="text-muted-foreground">
              사진을 클릭하면 크게 보실 수 있습니다
            </p>
          </div>
          
          {allImages.length > 0 ? (
            <Gallery images={allImages} data-testid="gallery-all" />
          ) : (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                아직 등록된 갤러리 이미지가 없습니다.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                곧 멋진 학원 사진들로 채워질 예정입니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Images with Captions */}
      {allImages.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground">갤러리 상세</h2>
              <p className="text-muted-foreground">
                각 이미지의 설명과 함께 보기
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleImages.map((image: any) => (
                <div key={image.id} className="group">
                  <div className="aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img 
                      src={image.url} 
                      alt={image.caption || '학원 갤러리 이미지'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      data-testid={`gallery-image-${image.id}`}
                    />
                  </div>
                  {image.caption && (
                    <p className="mt-3 text-sm text-muted-foreground text-center">
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    직접 방문해보세요
                  </h2>
                  <p className="text-muted-foreground">
                    사진으로 보신 학원의 모습을 직접 확인하고 상담받아보세요.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">학원 정보</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">주소:</span> 광주광역시 남구 봉선중앙로16, 2층</p>
                      <p><span className="font-medium">교통:</span> 버스 정류장 인근, 접근성 우수</p>
                      <p><span className="font-medium">주차:</span> 건물 주차 공간 이용 가능</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-4">상담 시간</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">평일:</span> 오전 9시 - 오후 10시</p>
                      <p><span className="font-medium">토요일:</span> 오전 9시 - 오후 6시</p>
                      <p><span className="font-medium">일요일:</span> 휴무</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8 pt-8 border-t border-border">
                  <p className="text-muted-foreground mb-4">
                    더 자세한 상담이나 학원 견학을 원하시면 연락해주세요.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="tel:062-462-0990" 
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
                      data-testid="button-call"
                    >
                      📞 전화 상담 (062-462-0990)
                    </a>
                    <a 
                      href="mailto:info@sidaeyoungjae.kr" 
                      className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors inline-flex items-center justify-center"
                      data-testid="button-email"
                    >
                      ✉️ 이메일 문의
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
