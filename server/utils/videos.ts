// 🎥 비디오 URL 정규화 및 검증 유틸리티

export function normalizeVideo(input: { type: 'youtube' | 'nas', url: string }) {
  const { type } = input;
  let { url } = input;

  // 공통 검증
  if (!url || typeof url !== 'string') {
    throw new Error('MALFORMED_URL');
  }
  
  if (url.length > 2000) {
    throw new Error('URL_TOO_LONG');
  }

  if (type === 'youtube') {
    // 1) YouTube ID 추출 - 모든 형식 지원 (개선된 정규식)
    //  - https://youtu.be/ID
    //  - https://www.youtube.com/watch?v=ID  
    //  - https://youtube.com/embed/ID
    //  - https://m.youtube.com/watch?v=ID (모바일)
    //  - 기타 쿼리 파라미터가 있어도 처리
    const patterns = [
      /youtu\.be\/([A-Za-z0-9_-]{6,})/, // youtu.be 단축링크
      /[?&]v=([A-Za-z0-9_-]{6,})/, // watch?v= 형식
      /\/embed\/([A-Za-z0-9_-]{6,})/ // embed 형식  
    ];
    
    let id: string | null = null;
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        id = match[1];
        break;
      }
    }
    
    if (!id) {
      throw new Error('YOUTUBE_ID_NOT_FOUND');
    }
    
    // 2) embed URL로 정규화
    url = `https://www.youtube.com/embed/${id}`;
    
    return { 
      type, 
      url, 
      meta: { id } 
    };
  }

  if (type === 'nas') {
    // URL 형식 검증
    if (!/^https?:\/\//i.test(url)) {
      throw new Error('INVALID_NAS_URL');
    }
    
    // 파일 확장자 검증 (더 엄격한 검사)
    const videoExtensions = /\.(mp4|webm|m4v|mov|avi|mkv|ogg|ogv)(\?.*)?$/i;
    if (!videoExtensions.test(url)) {
      // 확장자가 아예 없는 경우와 지원되지 않는 확장자 구분
      if (!/\.[a-zA-Z0-9]+(\?.*)?$/.test(url)) {
        throw new Error('FILE_EXTENSION_MISSING');
      } else {
        throw new Error('UNSUPPORTED_VIDEO_FORMAT');
      }
    }
    
    // HTTP URL에 대한 경고 (에러는 아님)
    if (url.startsWith('http://')) {
      console.warn('⚠️ HTTP URL detected - will use proxy for HTTPS compatibility');
    }
    
    return { type, url };
  }

  throw new Error('INVALID_TYPE');
}

// 🎯 상세한 에러 코드 및 메시지 매핑 시스템
export const VIDEO_ERROR_MESSAGES: Record<string, string> = {
  // YouTube 관련 에러
  'INVALID_YOUTUBE_URL': '유효하지 않은 YouTube URL입니다. youtu.be, youtube.com/watch?v=, 또는 youtube.com/embed 형식을 사용하세요.',
  'YOUTUBE_ID_NOT_FOUND': 'YouTube 동영상 ID를 찾을 수 없습니다. URL을 다시 확인해주세요.',
  
  // NAS 관련 에러  
  'INVALID_NAS_URL': 'NAS URL은 http:// 또는 https://로 시작해야 합니다.',
  'HTTPS_REQUIRED': 'HTTPS 사이트에서는 HTTPS URL을 사용하는 것이 권장됩니다. HTTP URL은 프록시를 통해 처리됩니다.',
  'UNSUPPORTED_VIDEO_FORMAT': '지원되지 않는 비디오 형식입니다. mp4, webm, m4v, mov, avi, mkv, ogg, ogv 파일만 지원됩니다.',
  'FILE_EXTENSION_MISSING': '파일 확장자가 없습니다. .mp4, .webm 등의 확장자를 포함해주세요.',
  
  // 일반 에러
  'INVALID_TYPE': '비디오 타입은 youtube 또는 nas만 가능합니다.',
  'URL_TOO_LONG': 'URL이 너무 깁니다. 2000자 이하로 입력해주세요.',
  'MALFORMED_URL': 'URL 형식이 잘못되었습니다. 올바른 URL을 입력해주세요.'
};

// 🔍 프론트엔드 사전 검증용 유틸리티
export const validateUrlFormat = {
  // YouTube URL 패턴 검증
  isYouTubeUrl: (url: string): boolean => {
    const patterns = [
      /youtu\.be\/[A-Za-z0-9_-]+/,
      /youtube\.com\/watch\?.*v=[A-Za-z0-9_-]+/,
      /youtube\.com\/embed\/[A-Za-z0-9_-]+/,
      /m\.youtube\.com\/watch\?.*v=[A-Za-z0-9_-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  },
  
  // NAS URL 패턴 검증  
  isNasUrl: (url: string): boolean => {
    return /^https?:\/\/.+\.(mp4|webm|m4v|mov|avi|mkv|ogg|ogv)(\?.*)?$/i.test(url);
  },
  
  // URL 길이 검증
  isValidLength: (url: string): boolean => {
    return url.length <= 2000;
  }
};