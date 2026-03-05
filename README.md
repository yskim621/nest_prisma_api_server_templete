# NestJS + Prisma API Server Template

MSA(Microservices Architecture) 또는 역할별 서버 분리 시스템에서 빠르게 개발하기 위한 NestJS 기반 API 서버 템플릿입니다.

## 주요 기능

- **NestJS 11** + **TypeScript 5.7** 기반
- **Prisma ORM** (MySQL)
- **JWT 인증** (Passport.js)
- **Redis 캐싱**
- **WebSocket** (Socket.IO)
- **Swagger API 문서화**
- **Winston 로깅** (일별 로테이션)
- **Prometheus 메트릭**
- **Health Check**

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Framework | NestJS 11, Express |
| Language | TypeScript 5.7 |
| Database | MySQL + Prisma ORM |
| Cache | Redis (ioredis) |
| Auth | JWT, Passport.js, bcrypt |
| Real-time | Socket.IO |
| Docs | Swagger |
| Logging | Winston + daily-rotate-file |
| Monitoring | Prometheus (prom-client) |
| Testing | Jest, Supertest |

---

## 프로젝트 구조

```
src/
├── common/                     # 공통 기능
│   ├── exceptions/             # 예외 필터 (전역 에러 핸들링)
│   ├── pipes/                  # 커스텀 파이프
│   ├── common.interface.ts     # 공통 인터페이스
│   ├── common.response.ts      # 표준 응답 포맷
│   └── common.type.ts          # 공통 타입
│
├── environment/                # 환경 변수 중앙 관리
│   └── index.ts
│
├── health/                     # 헬스 체크
│   ├── health.module.ts
│   └── health.controller.ts
│
├── interceptors/               # 전역 인터셉터
│   ├── every.interceptor.ts              # 요청/응답 로깅
│   └── transform.response.interceptor.ts # 응답 변환
│
├── middlewares/                # 전역 미들웨어
│   ├── logger.middleware.ts    # Winston 로깅
│   └── metric.middleware.ts    # Prometheus 메트릭
│
├── modules/
│   └── msl/                    # 비즈니스 도메인 모듈
│       ├── auth/               # 인증 (JWT + Passport)
│       ├── user/               # 사용자 관리
│       └── boards/             # 게시판
│
├── prisma/                     # Prisma 서비스 (Global)
│   ├── prisma.module.ts
│   └── nest_template.prisma.service.ts
│
├── redis/                      # Redis 서비스 (Global)
│   ├── redis.module.ts
│   └── redis.service.ts
│
├── routes/                     # API 라우트 모듈
│   └── minds-signal.module.ts
│
├── sockets/                    # WebSocket
│   ├── socket.module.ts
│   └── socket.gateway.ts
│
├── utils/                      # 유틸리티
│   ├── firebase.service.ts     # Firebase 푸시 알림
│   ├── mailer.service.ts       # 이메일 발송
│   └── cryto.util.ts           # 암호화
│
├── app.module.ts               # 루트 모듈
├── main.ts                     # 부트스트랩
└── metrics.controller.ts       # Prometheus 메트릭 엔드포인트
```

---

## 시작하기

### 요구사항

- Node.js >= 20.0.0
- npm >= 10.0.0
- MySQL
- Redis

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.default .env
# .env 파일을 열어 필요한 값 입력

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma db push
```

### 실행

```bash
# 개발 모드 (로컬)
npm run start:local

# 개발 서버
npm run start:dev

# 프로덕션
npm run build
npm run start:prod
```

### 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:cov
```

---

## 환경 변수 설정

| 변수 | 설명 | 예시 |
|------|------|------|
| PORT | API 서버 포트 | 4010 |
| SOCKETPORT | WebSocket 포트 | 4011 |
| SERVICE_DOMAIN | 서비스 도메인 | http://127.0.0.1:4010 |
| TIMEZONE | 타임존 | Asia/Seoul |
| LOG_LEVEL | 로그 레벨 | debug |
| PRISMA_DATABASE_URL | MySQL 연결 URL | mysql://user:pass@localhost:3306/db |
| REDIS_HOST | Redis 호스트 | localhost |
| REDIS_PORT | Redis 포트 | 6379 |
| REDIS_PASSWORD | Redis 비밀번호 | your_password |
| REDIS_DB | Redis DB 번호 | 0 |
| ACCESS_TOKEN_SECRET_KEY | Access 토큰 시크릿 | your_secret |
| REFRESH_TOKEN_SECRET_KEY | Refresh 토큰 시크릿 | your_secret |
| ACCESS_TOKEN_EXPIRES_IN | Access 토큰 만료 | 6h |
| REFRESH_TOKEN_EXPIRES_IN | Refresh 토큰 만료 | 24h |
| MAIL_HOST | SMTP 호스트 | smtp.gmail.com |
| MAIL_PORT | SMTP 포트 | 587 |
| MAIL_USERNAME | SMTP 사용자 | email@gmail.com |
| MAIL_PASSWORD | SMTP 비밀번호 | your_app_password |

---

## API 문서

서버 실행 후 Swagger 문서 확인:

```
http://localhost:4010/api/msl
```

---

## 주요 엔드포인트

### 인증

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /auth/login | 로그인 |

### 사용자

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /user/create | 사용자 생성 |
| GET | /user/list | 사용자 목록 (JWT 필요) |
| GET | /user/get/:id | 사용자 조회 |
| PATCH | /user/update/:id | 사용자 수정 |
| DELETE | /user/delete/:id | 사용자 삭제 |

### 게시판

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /boards/create | 게시판 생성 |
| GET | /boards | 게시판 목록 |
| GET | /boards/:id | 게시판 상세 |
| PATCH | /boards/:id | 게시판 수정 |
| DELETE | /boards/:id | 게시판 삭제 |

### 시스템

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /health | 헬스 체크 |
| GET | /health/ping | 외부 서비스 확인 |
| GET | /metrics | Prometheus 메트릭 |

---

## WebSocket

### 연결

```javascript
const socket = io('http://localhost:4011', {
  transports: ['websocket', 'polling']
});
```

### 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| joinRoom | Client -> Server | 채팅방 입장 |
| sendMessage | Client -> Server | 메시지 전송 |
| message | Server -> Client | 메시지 수신 |

### 예시

```javascript
// 방 입장
socket.emit('joinRoom', 'room-1');

// 메시지 전송
socket.emit('sendMessage', {
  room: 'room-1',
  author: 'user1',
  content: 'Hello!'
});

// 메시지 수신
socket.on('message', (data) => {
  console.log(data);
});
```

---

## 표준 응답 포맷

### 성공 응답

```json
{
  "code": "2000",
  "isSuccess": true,
  "message": "Success",
  "resSystem": "c",
  "comSystem": "central-common",
  "resTime": "2024-01-01T00:00:00.000Z",
  "data": { }
}
```

### 에러 응답

```json
{
  "code": "5021",
  "isSuccess": false,
  "message": "Unauthorized",
  "resSystem": "e",
  "comSystem": "central-common",
  "resTime": "2024-01-01T00:00:00.000Z",
  "data": null
}
```

### 에러 코드 체계

| 코드 범위 | 설명 |
|----------|------|
| 2000 | 성공 |
| 4xxx | 클라이언트 오류 |
| 5000-5012 | 데이터베이스 오류 |
| 5021-5035 | 인증/권한 오류 |
| 5041-5057 | 서버 오류 |
| 9999 | 미분류 오류 |

---

## 로깅

Winston 기반 로깅 시스템:

- **로그 파일 위치**: logs/
  - logs/error/ - 에러 로그
  - logs/warn/ - 경고 로그
  - logs/combined/ - 전체 로그
- **로테이션**: 일별 자동 로테이션
- **보관**: 30일
- **압축**: 자동 gzip 압축

---

## 모니터링

### Prometheus 메트릭

/metrics 엔드포인트에서 수집 가능한 메트릭:

- http_request_duration_seconds - HTTP 요청 응답 시간
- 메서드, 라우트, 상태 코드별 분류

### PM2 프로세스 관리

```bash
# PM2로 실행 (개발)
pm2 start process.dev.config.js

# 모니터링
pm2 monit
```

---

## Docker

### 파일 구조

```
├── Dockerfile              # 프로덕션 빌드 (멀티스테이지)
├── Dockerfile.dev          # 개발용 (Hot Reload)
├── docker-compose.yml      # 프로덕션 환경
├── docker-compose.dev.yml  # 개발 환경
├── .dockerignore           # Docker 빌드 제외 파일
└── .env.docker.example     # Docker 환경 변수 예시
```

### 빠른 시작 (프로덕션)

```bash
# 환경 변수 설정
cp env.docker.example .env

# 전체 스택 실행 (API + MySQL + Redis)
docker-compose up -d

# 로그 확인
docker-compose logs -f api

# 종료
docker-compose down
```

### 개발 환경 (Hot Reload)

```bash
# 개발 환경 실행
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f api

# 종료
docker-compose -f docker-compose.dev.yml down
```

### 개별 서비스 실행

```bash
# MySQL만 실행
docker-compose up -d mysql

# Redis만 실행
docker-compose up -d redis

# API만 빌드 및 실행
docker-compose up -d --build api
```

### 데이터베이스 마이그레이션

```bash
# 컨테이너 내부에서 Prisma 마이그레이션
docker-compose exec api npx prisma db push

# 또는 로컬에서 (Docker MySQL 연결)
DATABASE_URL="mysql://appuser:password@localhost:3306/nest_template" npx prisma db push
```

### 유용한 명령어

```bash
# 컨테이너 상태 확인
docker-compose ps

# API 컨테이너 쉘 접속
docker-compose exec api sh

# MySQL 접속
docker-compose exec mysql mysql -u root -p

# Redis CLI 접속
docker-compose exec redis redis-cli

# 볼륨 포함 완전 삭제
docker-compose down -v

# 이미지 재빌드
docker-compose build --no-cache api
```

### Docker 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| DB_NAME | 데이터베이스 이름 | nest_template |
| DB_USER | DB 사용자 | appuser |
| DB_PASSWORD | DB 비밀번호 | password |
| DB_ROOT_PASSWORD | DB 루트 비밀번호 | rootpassword |
| REDIS_PASSWORD | Redis 비밀번호 | (없음) |

### 포트 매핑

| 서비스 | 내부 포트 | 외부 포트 |
|--------|----------|----------|
| API | 4010 | 4010 |
| WebSocket | 4011 | 4011 |
| MySQL | 3306 | 3306 |
| Redis | 6379 | 6379 |

---

## 새 모듈 추가하기

### 1. 모듈 생성

```bash
nest g module modules/msl/[module-name]
nest g controller modules/msl/[module-name]
nest g service modules/msl/[module-name]
```

### 2. Repository 패턴 적용

```typescript
// [module-name].repository.ts
@Injectable()
export class ExampleRepository {
  constructor(private readonly prisma: MindsaiPrismaService) {}

  async findAll() {
    return this.prisma.example.findMany();
  }
}
```

### 3. 라우트 등록

src/routes/minds-signal.module.ts에 새 모듈 추가:

```typescript
@Module({
  imports: [
    // ... 기존 모듈
    ExampleModule,
  ],
})
export class MindsSignalModule {}
```

---

## 권장 VSCode 확장 프로그램

### 필수

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **Prisma** (Prisma.prisma)

### 권장

- **NestJS Files** (nestjs.nestjs-files)
- **Path Intellisense** (christian-kohler.path-intellisense)
- **Import Cost** (wix.vscode-import-cost)

---

## 스크립트

| 스크립트 | 설명 |
|----------|------|
| npm run build | 프로덕션 빌드 |
| npm run start | 서버 시작 |
| npm run start:local | 로컬 개발 (watch 모드) |
| npm run start:dev | 개발 서버 |
| npm run start:prod | 프로덕션 서버 |
| npm run start:debug | 디버그 모드 |
| npm test | 단위 테스트 |
| npm run test:e2e | E2E 테스트 |
| npm run test:cov | 테스트 커버리지 |
| npm run lint | ESLint 검사 및 수정 |
| npm run prisma:format | Prisma 스키마 포맷 |

---

## MSA 확장 가이드

현재 모노리식 구조이지만 MSA로 분리 가능한 설계입니다:

### 현재 구조

```
+-----------------------------+
|  API Server (4010)          |
|  +-- Auth Module            |
|  +-- User Module            |
|  +-- Board Module           |
|  +-- Socket Gateway (4011)  |
+-----------------------------+
```

### MSA 확장 시

```
+--------------+  +--------------+  +--------------+
| Auth Service |  | User Service |  | Board Service|
|    :4010     |  |    :4020     |  |    :4030     |
+--------------+  +--------------+  +--------------+
       |                 |                 |
       +--------+--------+--------+--------+
                |                 |
         +--------------+  +--------------+
         |  API Gateway |  | Message Queue|
         +--------------+  +--------------+
```

### 분리 시 필요 작업

1. **API Gateway** 추가 (Kong, Nginx, NestJS Gateway)
2. **서비스 디스커버리** (Consul, etcd)
3. **메시지 큐** (RabbitMQ, Redis Pub/Sub)
4. **분산 트레이싱** (Jaeger, Zipkin)

---

## 개선 예정 사항

- [x] Docker + docker-compose 설정
- [ ] CI/CD 파이프라인 (GitHub Actions)
- [ ] Rate Limiting 적용
- [ ] Role-based Access Control (RBAC)
- [ ] API 버전 관리 (v2)
- [ ] 테스트 커버리지 확대

---

## 라이선스

MIT License
