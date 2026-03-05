# ================================
# Build Stage
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./
COPY prisma ./prisma/

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# 빌드
RUN npm run build

# ================================
# Production Stage
# ================================
FROM node:20-alpine AS production

WORKDIR /app

# 보안: non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Prisma 스키마 및 클라이언트 복사
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# Firebase 설정 파일 (필요한 경우)
COPY --chown=nestjs:nodejs firebase.json* ./

# 로그 디렉토리 생성 (앱 루트 및 dist 내부)
RUN mkdir -p logs dist/logs && \
    chown -R nestjs:nodejs logs dist/logs /app

# non-root 사용자로 전환
USER nestjs

# 환경 변수
ENV NODE_ENV=production
ENV PORT=4010
ENV SOCKETPORT=4011

# 포트 노출
EXPOSE 4010 4011

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4010/health || exit 1

# 실행
CMD ["node", "dist/main.js"]
