## 👉 꼭 설치할 VSCode 확장 프로그램들

### ✅ 코딩 스타일 & 품질

- **ESLint** (`dbaeumer.vscode-eslint`)  
  └ TypeScript, NestJS 전역 규칙 통일

- **Prettier – Code formatter** (`esbenp.prettier-vscode`)  
  └ 코드 자동 정렬 (팀 협업 필수)

### ✅ NestJS 개발에 유용

- **NestJS Files** (`nestjs.nestjs-files`)  
  └ Nest 구조 기반 파일 생성 템플릿 (서비스, 컨트롤러 등 빠르게 생성)

- **Path Intellisense** (`christian-kohler.path-intellisense`)  
  └ import 경로 자동완성 (`@/`, `../../` 구조 빠르게)

- **Import Cost** (`wix.vscode-import-cost`)  
  └ import 시 실제 번들 크기 표시 (프론트에 더 유용하지만 백엔드에서도 가벼운 체크용)

### ✅ Prisma & DB 개발용

- **Prisma** (`Prisma.prisma`)  
  └ schema.prisma 하이라이팅 + 자동완성 + 오류 체크

# 📁 프로젝트 디렉토리 구조 (NestJS 기반)

## ── src/api/version1/

- 주요 도메인 기반 RESTful API 정의
- 각 폴더는 하위 도메인: admin, hormone, hospital, psychological, user 등
- 버전 관리 폴더(`version1`, `version2`)로 API 버전 구분

## ── src/auth/

- 인증 관련 전반을 담당하는 모듈
- `dto/`: 로그인 등 인증 요청 객체 정의
- `guard/`: `JwtAuthGuard`, `RolesGuard` 등 인증/인가 처리
- `roles/`: enum 및 custom decorator (`@RoleRequired`) 등
- `auth.jwt.service.ts`: accessToken / refreshToken 생성, 검증 로직
- `auth.service.ts`: 로그인 비즈니스 로직 (비밀번호 확인, salt 갱신, history 기록 등)

## ── src/app/

- 애플리케이션 설정 관련 루트 모듈 (필요 시 확장 가능)

## ── src/events/

- 향후 event-based 구조 확장 고려 시 사용 (현재는 미사용/미정)

## ── src/interceptors/

- 공통 응답 포맷(`CommonResponse<T>`)을 위한 인터셉터
- 성공 시 data wrapping 처리

## ── src/interface/

- 전역적으로 사용하는 타입/인터페이스 정의
- `UserPayload`, `JwtTokenModel`, `CommonResponse` 등 포함

## ── src/prisma/

- `schema.prisma`, Prisma Client 등 데이터베이스 관련 정의
- soft delete, user-role 관계, 로그인 기록 포함

## ── src/redis/

- `ioredis` 기반 Redis 모듈
- ACL 기반 사용자 인증 + 토큰 저장 로직 구성 예정

## ── src/types/express/

- Express Request 확장 (e.g. 사용자 정보 커스텀 삽입 시)

## ── src/utils/

- 공통 유틸 함수: crypto(SHA-256+salt), 날짜 포맷 등

## 🔧 환경 변수 설정 (`.env`)

| 변수                       | 설명                                            |
| -------------------------- | ----------------------------------------------- |
| `PRISMA_DATABASE_URL`       | MySQL 연결 URL                                  |
| `PORT`                     | NestJS API 서버 포트                            |
| `SOCKETPORT`               | WebSocket 서버 포트                             |
| `SERVICE_DOMAIN`           | 서버의 기본 도메인                              |
| `TIMEZONE`                 | 서버 타임존 설정 (Asia/Seoul 등)                |
| `LOG_LEVEL`                | 로그 레벨 (debug/info/warn/error)               |
| `WHOIS`                    | 배포자 또는 환경 구분자 (개발자 이름 등)        |
| `REDIS_*`                  | Redis 접속 정보 및 인증 설정                    |
| `MAIL_*`                   | Gmail SMTP 설정 (2단계 인증 + 앱 비밀번호 필요) |
| `ACCESS_TOKEN_SECRET_KEY`  | JWT access token 비밀 키                        |
| `REFRESH_TOKEN_SECRET_KEY` | JWT refresh token 비밀 키                       |
| `*_EXPIRES_IN`             | JWT 토큰 만료 시간 (6h, 24h 등)                 |
| `GOOGLE_*`                 | Google OAuth 2.0 설정 정보 (선택적)             |
| `ENCRYPTION_SECRET_KEY`    | 메시지 암호화/복호화용 AES-256 보안 키          |
