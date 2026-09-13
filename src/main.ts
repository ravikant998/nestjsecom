import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration
  const configService = app.get(ConfigService);

  // API prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api/v1';

  app.setGlobalPrefix(apiPrefix);

  // Security
  app.use(helmet());

  // Compression
  app.use(compression());

  // CORS
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

  // Global validation
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

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestDemo API')
    .setDescription('NestJS Authentication API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization')
    .addTag('users', 'User management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Swagger UI
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Vercel provides PORT in production.
  // 3000 is used when running locally.
  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
}

void bootstrap();
