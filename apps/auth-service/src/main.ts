import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthServiceModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_SERVICE_HOST || '0.0.0.0',
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
    },
  });

  await app.listen();
  logger.log(`Auth Service is listening on TCP port ${process.env.AUTH_SERVICE_PORT || 3001}`);
}

void bootstrap();
