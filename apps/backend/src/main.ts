/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './modules/shared/filters/global-exception.filter';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = Number(process.env.BACKEND_PORT || process.env.PORT || 3000);
  await app.listen(port);

  Logger.log(
    `🚀 Backend application is running on: http://localhost:${port}`
  );
}

bootstrap();
