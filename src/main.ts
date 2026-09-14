import compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response.interceptor';

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api/v1';

  app.setGlobalPrefix(apiPrefix);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.use(compression());

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestDemo API')
    .setDescription('NestJS Authentication API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization')
    .addTag('users', 'User management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();

  return app;
}

async function bootstrap(): Promise<void> {
  const app = await createApp();

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
}

void bootstrap();
