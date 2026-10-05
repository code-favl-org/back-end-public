import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';
import { createCookieSessionMiddleware } from './modules/auth/cookie-session.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const requestLogger = new Logger('HTTP');
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.getHttpAdapter().getInstance().get('/', (_req, res) => {
    res.status(200).json({
      name: 'FAVL API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });
  app.getHttpAdapter().getInstance().get('/administracion', (_req, res) => {
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Transport'],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(cookieParser());
  app.use(createCookieSessionMiddleware(app.get(AuthService)));
  app.use(
    morgan(':date[iso] :method :url :status :response-time ms', {
      stream: {
        write: (message) => requestLogger.log(message.trim()),
      },
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FAVL API')
    .setDescription(
      'API FAVL. Access/refresh son JWT. AUTH_STRATEGY admite cookie, bearer o both; los access JWT se validan localmente y el refresh rota la sesión guardada.',
    )
    .setVersion('1.0.0')
    .addCookieAuth('favl_access', { type: 'apiKey', in: 'cookie' }, 'session-cookie')
    .addCookieAuth('favl_refresh', { type: 'apiKey', in: 'cookie' }, 'refresh-cookie')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'opaque' }, 'session-bearer')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument,{
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Servidor iniciado correctamente en http://localhost:${port}`);
  logger.log(`Documentación Swagger disponible en http://localhost:${port}/api/docs`);
}
bootstrap();
