import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { urlencoded, json } from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const logger = new Logger('ApiGateway');

  const app = await NestFactory.create<NestExpressApplication>(GatewayModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.useWebSocketAdapter(new IoAdapter(app));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MindsAI API Gateway ' + (process.env.NODE_ENV || 'dev'))
    .setDescription('MindsAI Minds Signal API docs')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'Bearer',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your JWT token',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/msl', app, document);

  const port = process.env.PORT || 4010;
  await app.listen(port);
  logger.log('API Gateway is running on port ' + port);
}

void bootstrap();
