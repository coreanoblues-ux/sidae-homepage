import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Users, BookOpen, Target, CheckCircle } from "lucide-react";
import { Program } from "@shared/schema";

export default function ProgramPage() {
  const { slug } = useParams();

  const { data: program, isLoading, error } = useQuery<Program>({
    queryKey: ['/api/programs', slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 dark:from-slate-900 to-white dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
            <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-4/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 dark:from-slate-900 to-white dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <button 
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
              data-testid="link-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </button>
          </Link>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4" data-testid="text-error-title">
              프로그램을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400" data-testid="text-error-message">
              요청하신 프로그램이 존재하지 않거나 현재 이용할 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 dark:from-slate-900 to-white dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <Link href="/">
          <button 
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 transition-colors"
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </button>
        </Link>

        {/* 헤더 섹션 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3" data-testid="text-program-title">
            {program.title}
          </h1>
          {program.subtitle && (
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4" data-testid="text-program-subtitle">
              {program.subtitle}
            </h2>
          )}
          {program.description && (
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed" data-testid="text-program-description">
              {program.description}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6" data-testid="text-content-title">
                프로그램 상세 내용
              </h3>
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                data-testid="content-program-details"
                dangerouslySetInnerHTML={{ __html: program.content }}
              />
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 대상 학생 */}
            {program.targetStudents && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-target-title">
                    대상 학생
                  </h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300" data-testid="text-target-students">
                  {program.targetStudents}
                </p>
              </div>
            )}

            {/* 주요 특징 */}
            {program.features && program.features.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-features-title">
                    주요 특징
                  </h4>
                </div>
                <ul className="space-y-2" data-testid="list-features">
                  {program.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300" data-testid={`text-feature-${index}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 커리큘럼 */}
            {program.curriculum && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100" data-testid="text-curriculum-title">
                    커리큘럼
                  </h4>
                </div>
                <div 
                  className="text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert"
                  data-testid="content-curriculum"
                  dangerouslySetInnerHTML={{ __html: program.curriculum }}
                />
              </div>
            )}

            {/* 문의하기 버튼 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2" data-testid="text-contact-title">
                프로그램 문의
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4" data-testid="text-contact-description">
                더 자세한 정보가 필요하시거나 상담을 원하시면 언제든 연락해주세요.
              </p>
              <a
                href="tel:062-123-4567"
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                data-testid="button-contact"
              >
                상담 문의하기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}