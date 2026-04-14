# GitHub & Railway 연동 완벽 가이드

배포 자동화를 위해 다음 단계를 따르세요.

## 1️⃣ 로컬 Git 설정 확인

```bash
git config user.email
git config user.name
```

이미 설정되어 있으면 다음 단계로 진행하세요.

## 2️⃣ GitHub에 푸시하기

### 방법 A: GitHub CLI (권장)

```bash
# GitHub CLI 설치
# Windows: winget install GitHub.cli
# Mac: brew install gh

# GitHub 로그인
gh auth login

# 푸시
git push origin main
```

### 방법 B: Personal Access Token (PAT)

1. [GitHub 설정 페이지](https://github.com/settings/tokens)에서 "Tokens (classic)" 클릭
2. "Generate new token (classic)" 선택
3. 권한 설정:
   - `repo` (전체)
   - `workflow` (GitHub Actions)
4. 토큰 복사

5. 로컬에서 푸시할 때 Password로 토큰 사용:
```bash
git push origin main
# Username: coreanoblues-ux
# Password: github_pat_xxxxxxxxxxxxx
```

### 방법 C: SSH 키 사용

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "coreanoblues@gmail.com"

# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# GitHub 설정 > SSH and GPG keys > New SSH key에 붙여넣기

# 원격 저장소 URL 변경
git remote set-url origin git@github.com:coreanoblues-ux/sidae-homepage.git

# 푸시
git push origin main
```

## 3️⃣ Railway에서 배포 설정

### 1. Railway 프로젝트 생성

1. [Railway.app](https://railway.app)에 로그인
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택: `coreanoblues-ux/sidae-homepage`

### 2. 환경 변수 설정

Railway 대시보드에서 Variables 섹션에서 추가:

```
DATABASE_URL=postgresql://...      # PostgreSQL 플러그인 추천
NODE_ENV=production
PORT=3000
API_ORIGIN=https://[railway-domain].up.railway.app
FRONT_ORIGIN=https://[railway-domain].up.railway.app
COOKIE_DOMAIN=your-domain.com
SESSION_SECRET=[생성: openssl rand -hex 32]
JWT_SECRET=[생성: openssl rand -hex 32]
SUPERADMIN_PASSWORD=your-password
```

### 3. PostgreSQL 플러그인 추가 (선택)

1. Railway 대시보드 → "Plugins"
2. "Create" → "PostgreSQL"
3. `DATABASE_URL`이 자동으로 생성됨

### 4. 배포 테스트

Railway 대시보드에서 "Deploy" 또는 GitHub에 푸시하면 자동 배포 시작

## 4️⃣ Cloudflare 도메인 연결 (이미 설정된 경우 스킵)

### DNS 설정

Cloudflare 대시보드에서:

```
Type: CNAME
Name: www (또는 서브도메인)
Target: [railway-domain].up.railway.app
TTL: Auto
Proxy: Proxied (또는 DNS Only)
```

## 5️⃣ 작업 흐름 (배포 자동화 사용)

GitHub Actions를 통한 자동 배포 설정하려면:

### 5-1. Railway API Token 생성

```bash
# Railway CLI로 로그인
railway login

# 토큰 생성
railway token
```

### 5-2. GitHub Secrets 추가

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 secrets 추가:

   - **Name**: `RAILWAY_TOKEN`
     **Value**: `railway token` 명령으로 생성한 토큰

   - **Name**: `RAILWAY_PROJECT_ID`
     **Value**: Railway 프로젝트 URL에서 `https://railway.app/project/[이-부분]`

### 5-3. 워크플로우 확인

`.github/workflows/deploy.yml`이 자동으로 `main` 브랜치 푸시 시 실행됩니다.

## 🚀 배포 프로세스

이제 다음과 같이 작동합니다:

```
1. 로컬에서 수정
   ↓
2. git commit & push (GitHub)
   ↓
3. GitHub Actions 워크플로우 실행
   ↓
4. Railway 자동 배포
   ↓
5. 도메인에서 확인
```

## 🔍 배포 상태 확인

### Railway 로그
```bash
railway login
railway logs
```

### GitHub Actions
GitHub 저장소 → "Actions" 탭에서 실시간 확인

## 🛠️ 일반적인 문제

### 1. 빌드 실패
**확인사항:**
- Railway 로그 확인
- 로컬에서 `npm run build` 성공 확인
- 모든 환경 변수 설정 확인

### 2. 배포는 되는데 흰 화면
**원인:** 클라이언트 번들 또는 API 연결 문제
```bash
# 로컬에서 테스트
NODE_ENV=production npm run build
npm run start
```

### 3. 데이터베이스 연결 실패
**확인:**
```bash
# DATABASE_URL 형식 확인
psql $DATABASE_URL
```

## 💡 팁

### 로컬 테스트 서버
```bash
# 개발 서버
npm run dev

# 프로덕션 빌드 테스트
npm run build
NODE_ENV=production npm run start
# http://localhost:3000
```

### TypeScript 체크
```bash
npm run check
```

## 📚 참고 자료

- [Railway 문서](https://docs.railway.app)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Express 배포 가이드](https://expressjs.com/en/advanced/best-practice-deployment.html)
- [Railway CLI 가이드](https://docs.railway.app/reference/railway-cli)

---

**만약 계속 문제가 발생하면:**
- Railway & GitHub 대시보드 로그 확인
- 환경 변수 재확인
- 로컬 빌드 테스트
