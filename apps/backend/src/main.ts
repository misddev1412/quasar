/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './modules/shared/filters/global-exception.filter';
import { TrpcRouter } from './trpc/trpc.router';

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
    if (!req.headers['content-type'] && req.method === 'POST') {
      req.headers['content-type'] = 'application/json';
    }
    next();
  });
  
  // Apply global filters and pipes
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Apply TRPC middleware
  const trpc = app.get(TrpcRouter);
  await trpc.applyMiddleware(app);
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
