import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('APPonteBootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security headers & compression
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  // CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Tenant-Id',
  });

  // Global prefix for REST API
  app.setGlobalPrefix('api');

  // Static files for uploaded photos/videos
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });

  // Global pipes, filters & interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('APPonte API')
    .setDescription(
      'Documentação da API RESTful da plataforma APPonte — Participação Cidadã, Rede Social e SaaS Multi-tenant.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticação, registro, refresh token e recuperação de conta')
    .addTag('Users', 'Gestão de usuários, perfis e permissões')
    .addTag('Tenants', 'Gestão multi-tenant de Prefeituras e Organizações')
    .addTag('Departments', 'Secretarias municipais de atendimento')
    .addTag('Request Categories', 'Categorias e subcategorias de serviços públicos')
    .addTag('Requests', 'Gestão completa do ciclo de solicitações cidadãs e mapa geoespacial')
    .addTag('Request Comments', 'Comentários sociais e notas internas de atendimento')
    .addTag('Request Supports', 'Sistema de upvotes e apoios cívicos')
    .addTag('Advertisements', 'Módulo de monetização SaaS com anúncios e métricas')
    .addTag('SaaS Plans', 'Planos de assinatura e quotas')
    .addTag('Notifications', 'Central de notificações ao usuário')
    .addTag('Dashboard', 'Agregação analítica e indicadores por perfil')
    .addTag('Uploads', 'Upload de fotos, vídeos e documentos comprobatórios')
    .addTag('Audit Logs', 'Trilhas de auditoria para segurança e compliance')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'APPonte API Docs & Swagger',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 APPonte API rodando com sucesso na porta ${port}`);
  logger.log(`📚 Swagger OpenAPI disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
