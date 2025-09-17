import { Gallery } from "@/components/shared/Gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image, Users, Building } from "lucide-react";

export default function GalleryPage() {
  // Gallery images organized by category
  const instructorImages = [
    "/images/IMG_6558_1758101099677.JPG",
    "/images/IMG_6559_1758101109393.JPG",
    "/images/IMG_6544_1758101075476.JPG",
  ];

  const classroomImages = [
    "@assets/IMG_6554_1758101087993.JPG",
    "@assets/IMG_6556_1758101093935.JPG",
  ];

  const facilityImages = [
    "@assets/IMG_6544_1758101075476.JPG",
  ];

  const allImages = [...instructorImages, ...classroomImages, ...facilityImages];

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
          
          <Gallery images={allImages} data-testid="gallery-all" />
        </div>
      </section>

      {/* Categorized Galleries */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Instructor Section */}
          <div className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">시대영재 학원 원장</h2>
                <p className="text-muted-foreground">원장님의 프로필과 강의 모습</p>
              </div>
            </div>
            <Gallery images={instructorImages} data-testid="gallery-instructor" />
          </div>

          {/* Classroom Section */}
          <div className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <Camera className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">수업 현장</h2>
                <p className="text-muted-foreground">실제 수업이 진행되는 모습들</p>
              </div>
            </div>
            <Gallery images={classroomImages} data-testid="gallery-classroom" />
          </div>

          {/* Facilities Section */}
          <div>
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">학원 시설</h2>
                <p className="text-muted-foreground">현대적이고 쾌적한 교육 환경</p>
              </div>
            </div>
            <Gallery images={facilityImages} data-testid="gallery-facilities" />
          </div>
        </div>
      </section>

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
