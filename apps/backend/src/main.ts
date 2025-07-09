/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend apps
  app.enableCors({
    origin: [
      'http://localhost:3000', // Client app
      'http://localhost:4200', // Admin app
      'http://localhost:4000', // Alternative ports
    ],
    credentials: true,
  });
  
  // Add middleware to handle content-type for tRPC requests
  app.use('/api/trpc', (req, res, next) => {
    // If no content-type is set and it's a POST request, set it to application/json
    if (req.method === 'POST' && !req.headers['content-type']) {
      req.headers['content-type'] = 'application/json';
    }
    next();
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
