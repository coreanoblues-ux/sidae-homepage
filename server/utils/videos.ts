// 🎥 비디오 URL 정규화 및 검증 유틸리티

export function normalizeVideo(input: { type: 'youtube' | 'nas', url: string }) {
  const { type } = input;
  let { url } = input;

  if (type === 'youtube') {
    // 1) YouTube ID 추출 - 모든 형식 지원
    //  - https://youtu.be/ID
    //  - https://www.youtube.com/watch?v=ID
    //  - https://youtube.com/embed/ID
    //  - https://m.youtube.com/watch?v=ID (모바일)
    //  - 기타 쿼리 파라미터가 있어도 처리
    const m =
      url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
      url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
      url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
    
    if (!m) {
      throw new Error('INVALID_YOUTUBE_URL');
    }
    
    const id = m[1];
    
    // 2) embed URL로 정규화
    url = `https://www.youtube.com/embed/${id}`;
    
    return { 
      type, 
      url, 
      meta: { id } 
    };
  }

  if (type === 'nas') {
    // http/https 둘 다 허용
    if (!/^https?:\/\//i.test(url)) {
      throw new Error('INVALID_NAS_URL');
    }
    
    // mp4, webm, m4v, mov, avi 등 일반적인 비디오 포맷 지원
    if (!/\.(mp4|webm|m4v|mov|avi|mkv|ogg|ogv)(\?.*)?$/i.test(url)) {
      throw new Error('UNSUPPORTED_VIDEO_FORMAT');
    }
    
    return { type, url };
  }

  throw new Error('INVALID_TYPE');
}

// 에러 메시지 매핑
export const VIDEO_ERROR_MESSAGES: Record<string, string> = {
  'INVALID_YOUTUBE_URL': '유효하지 않은 YouTube URL입니다. youtu.be, youtube.com/watch?v=, 또는 youtube.com/embed 형식을 사용하세요.',
  'INVALID_NAS_URL': 'NAS URL은 http:// 또는 https://로 시작해야 합니다.',
  'UNSUPPORTED_VIDEO_FORMAT': '지원되지 않는 비디오 형식입니다. mp4, webm, m4v, mov, avi, mkv, ogg, ogv 파일만 지원됩니다.',
  'INVALID_TYPE': '비디오 타입은 youtube 또는 nas만 가능합니다.'
};