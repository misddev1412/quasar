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
  app.enableCors(); // 允许跨域请求

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局启用验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 自动剥离非DTO中定义的属性
    forbidNonWhitelisted: true, // 如果存在非白名单属性，则抛出错误
    transform: true, // 自动转换payload为DTO实例类型
    transformOptions: {
      enableImplicitConversion: true
    }
  }));

  // 全局启用序列化拦截器，以配合class-transformer使用
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  Logger.log(
    `🚀 Backend application is running on: http://localhost:${port}`
  );
}

bootstrap();
