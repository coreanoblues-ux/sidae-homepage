# 배포 가이드

이 문서는 GitHub와 Railway를 통한 자동 배포 설정 방법을 설명합니다.

## 프로젝트 구조

- **클라이언트**: React + Vite (TypeScript)
- **서버**: Express.js + Node.js (TypeScript)
- **데이터베이스**: PostgreSQL (Drizzle ORM)
- **인프라**: Railway.app + Cloudflare

## 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/coreanoblues-ux/sidae-homepage.git
cd sidae-homepage
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 필요한 환경 변수를 입력하세요:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
SUPERADMIN_PASSWORD=your-password
API_ORIGIN=http://localhost:3000
FRONT_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
```

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

## Railway 배포 설정

### 1. Railway 프로젝트 생성

1. [Railway.app](https://railway.app)에 로그인
2. "New Project" → "Deploy from GitHub repo" 선택
3. GitHub 저장소 선택: `coreanoblues-ux/sidae-homepage`

### 2. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 설정하세요:

```
DATABASE_URL=postgresql://...          # Railway PostgreSQL 플러그인 사용 권장
NODE_ENV=production
PORT=3000
API_ORIGIN=https://your-railway-domain.up.railway.app
FRONT_ORIGIN=https://your-railway-domain.up.railway.app
COOKIE_DOMAIN=your-domain.com
SESSION_SECRET=your-secure-random-string
JWT_SECRET=your-jwt-secret
SUPERADMIN_PASSWORD=your-password
ISSUER_URL=https://your-auth-provider.com (선택사항)
```

### 3. 데이터베이스 플러그인 추가 (선택사항)

Railway에서 PostgreSQL을 자동으로 추가할 수 있습니다:

1. Railway 대시보드의 "Plugins" 탭
2. "Create" → "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경 변수가 생성됩니다

### 4. 빌드 및 배포

Railway는 자동으로 다음을 수행합니다:

1. `npm run build` 실행 (Procfile에 정의됨)
2. 빌드된 파일 배포
3. `npm run start` 실행

## GitHub Actions 자동 배포 (선택사항)

`main` 브랜치에 푸시할 때마다 자동으로 Railway에 배포하도록 설정할 수 있습니다.

### 설정 단계

1. **GitHub Secrets 추가**

   Repository Settings → Secrets and variables → Actions에서 다음을 추가:

   - `RAILWAY_TOKEN`: Railway 계정의 API 토큰
   - `RAILWAY_PROJECT_ID`: Railway 프로젝트 ID

2. **Railway 토큰 생성**

   ```bash
   railway login
   railway token
   ```

   생성된 토큰을 GitHub Secrets의 `RAILWAY_TOKEN`에 추가합니다.

3. **워크플로우 확인**

   `.github/workflows/deploy.yml`이 자동으로 실행됩니다.

## Cloudflare 도메인 연결

### 1. 도메인 DNS 설정

Cloudflare DNS 관리에서 다음을 추가:

```
Type: CNAME
Name: www (또는 원하는 서브도메인)
Target: your-railway-domain.up.railway.app
Proxied: Yes (또는 DNS only)
```

### 2. Railway 도메인 설정

Railway 대시보드에서 Custom Domain 추가:
1. Settings → Custom Domain
2. `www.your-domain.com` 입력

## 배포 후 확인

1. Railway 대시보드에서 배포 상태 확인
2. 도메인으로 접속하여 정상 작동 확인
3. 로그 확인:
   ```bash
   railway logs
   ```

## 일반적인 문제 해결

### 빌드 실패
- 로그 확인: Railway 대시보드 → Logs
- TypeScript 에러: `npm run check` 로컬에서 실행

### 데이터베이스 연결 실패
- `DATABASE_URL` 환경 변수 확인
- 마이그레이션 실행: `npm run db:push`

### 배포 후 흰 화면
- 클라이언트 번들 빌드 확인
- API_ORIGIN, FRONT_ORIGIN 설정 확인

## 개발 워크플로우

### 로컬 개발
```bash
# 수정 후 테스트
npm run dev

# TypeScript 체크
npm run check
```

### 커밋 및 푸시
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

### Railway 배포 (자동)
1. GitHub Actions 워크플로우 실행
2. 배포 완료 후 자동으로 업데이트됨

## 참고 자료

- [Railway 문서](https://docs.railway.app)
- [Cloudflare DNS 설정](https://developers.cloudflare.com/dns/)
- [Express 배포 가이드](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**마지막 업데이트**: 2026년 4월
