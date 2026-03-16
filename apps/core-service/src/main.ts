import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { CoreServiceModule } from './core-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('CoreService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CoreServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.CORE_SERVICE_PORT, 10) || 3002,
    },
  });

  await app.listen();
  logger.log('Core Service is listening on TCP port ' + (process.env.CORE_SERVICE_PORT || 3002));
}

void bootstrap();
