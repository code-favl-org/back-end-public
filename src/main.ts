import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express } from 'express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import morgan from 'morgan';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const requestLogger = new Logger('HTTP');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsDirectory = process.env.UPLOADS_DIR;
  if (!uploadsDirectory) {
    throw new Error('Missing required environment variable: UPLOADS_DIR');
  }
  app.useStaticAssets(resolve(process.cwd(), uploadsDirectory), { prefix: '/upload/' });
  const server = app.getHttpAdapter().getInstance() as Express;
  server.disable('x-powered-by');
  server.get('/', (_req, res) => {
    res.status(200).json({
      name: 'FAVL API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
  server.get('/administracion', (_req, res) => {
    res.status(200).json({
      name: 'FAVL Admin',
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type'],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(
    morgan(':date[iso] :method :url :status :response-time ms', {
      stream: {
        write: (message) => requestLogger.log(message.trim()),
      },
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FAVL API')
    .setDescription('API pública FAVL de solo lectura.')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  const dataSource = app.get(DataSource);
  const { type, database } = dataSource.options as {
    type?: string;
    database?: string;
  };
  logger.log(`Conexión a la base de datos establecida (${type}: ${database}).`);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Servidor iniciado correctamente en http://localhost:${port}`);
  logger.log(
    `Documentación Swagger disponible en http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
