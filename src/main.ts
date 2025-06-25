import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { urlencoded, json } from 'body-parser';
import { EveryInterceptor } from './interceptors/every.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
// import { ResponseInterceptor } from './interceptors/response.interceptor';
import { ResponseInterceptor } from './interceptors/transform.response.interceptor';
import { WinstonLoggerService } from './middlewares/logger.middleware';
import { SERVICE_DOMAIN, PORT, REDIS_HOST, REDIS_PORT } from './environment';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MindsSignalModule } from './routes/minds-signal.module';
import { AllExceptionsFilter } from './interceptors/all-exception.filters';
import helmet from 'helmet';

const originalLog = console.log;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log = (...args: any[]) => {
  // to kst time
  const kstOffset = 9 * 60 * 60 * 1000; // KST is UTC+9
  const kstDate = new Date(Date.now() + kstOffset);
  const kstTimestamp = kstDate.toISOString().replace('T', ' ').substring(0, 19);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  originalLog(`[${kstTimestamp}]`, ...args);
};

const originalError = console.error;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.error = (...args: any[]) => {
  const kstOffset = 9 * 60 * 60 * 1000; // KST is UTC+9
  const kstDate = new Date(Date.now() + kstOffset);
  const kstTimestamp = kstDate.toISOString().replace('T', ' ').substring(0, 19);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  originalError(`[${kstTimestamp}] ❌`, ...args);
};

async function bootstrap() {
  const logger = new Logger('bootstrap');

  // 전역 유효성 검사 파이프 설정 (DTO 기반 자동 검증)// NestJS 애플리케이션 생성 (Express 기반)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true, // CORS(Cross-Origin Resource Sharing)를 기본적으로 활성화
    logger: new WinstonLoggerService(),
  });
  // 전역 유효성 검사 파이프 설정 (DTO 기반 자동 검증)
  app.useGlobalPipes(new ValidationPipe());
  // sql 에러 처리
  app.useGlobalFilters(new AllExceptionsFilter());
  // 전역 인터셉터 등록 - 모든 요청에 대해 EveryInterceptor 실행
  app.useGlobalInterceptors(new EveryInterceptor());
  // 전역 인터셉터 등록 - 모든 응답을 ResponseInterceptor 가공
  app.useGlobalInterceptors(new ResponseInterceptor());
  // 전역 인터셉터 등록 - 모든 예외를 HttpExceptionFilter 가공
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new AllExceptionsFilter());
  // CORS 활성화 (위에서 설정했지만 이중 설정해도 문제 없음)
  app.enableCors();
  // 웹사이트에서 XSS(Cross Site Scripting)공격 방지[인라인 js or css 블럭]
  app.use(
    helmet({
      // csp 설정
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  // JSON 바디 파서 설정 (요청 본문 용량 제한을 50MB로 설정)
  app.use(json({ limit: '50mb' }));
  // URL 인코딩된 바디 파서 설정 (폼 전송 방식 지원, limit도 50MB로 설정)
  app.use(urlencoded({ limit: '50mb', extended: true }));
  // WebSocket 어댑터 등록 - 기본적으로는 Socket.IO 기반 WebSocket 처리용
  app.useWebSocketAdapter(new IoAdapter(app));
  console.log(`✅ Redis 연결 → ${REDIS_HOST}:${REDIS_PORT}`);

  const SwaggerUserOptions = new DocumentBuilder()
    .setTitle(`MindsAI Minds Traffic Light API docs ${process.env.NODE_ENV}`)
    .setDescription('MindsAI Minds Traffic Light API docs')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'Bearer',
      in: 'header',
      name: 'Authorization',
      description: '로그인 후 받는 토큰 입력',
    })
    .build();
  const documentMtl = SwaggerModule.createDocument(app, SwaggerUserOptions, {
    include: [MindsSignalModule],
  });
  SwaggerModule.setup('api/msl', app, documentMtl);

  await app.listen(process.env.PORT);

  process.env.NODE_ENV != 'prod'
    ? Logger.log(`🚀  Local Server ready at ${SERVICE_DOMAIN}:${PORT}`, 'Bootstrap')
    : Logger.log(`🚀  Production Server ready at ${SERVICE_DOMAIN}:${PORT}`, 'Bootstrap');
}

// "Simplicity is the soul of efficiency."
// 단순함은 효율성의 핵심이다.
// 코드는 나를 위히, 동료를 위해, 미래의 나를 위해 읽기 쉽게 쓰는 것이 좋다.
void bootstrap();
