Plan de unificación FAVL
Resumen ejecutivo
back-end-public es el proyecto canónico. Tiene TypeORM, MariaDB, JWT, cookies de sesión, Swagger, DTOs, validación, permisos granulares. Está funcionando y sirve al front-end-public.

back-end-admin es un prototipo. Tiene Nunjucks y un backoffice armado, pero sin DB, sin ORM, sin auth real. Solo sirve para ver cómo se vería el panel.

front-end-public funciona y consume /api/* del back-end-public.

front-end-admin es AdminLTE legacy, abandonado.

Decisión: se construye el backoffice dentro del back-end-public, reutilizando sus módulos reales (noticias, clubes, eventos, pilotos, etc.) y su sistema de auth. Del back-end-admin se rescata solo la capa de vistas Nunjucks (layout, partials, macros, menú, matriz de acceso).

Resultado esperado: un solo backend (back-end-public) que:

Sirve /api/* al frontend público (como hoy).

Sirve /administracion/* (backoffice Nunjucks con roles) a los administradores.

Escribe en la DB real vía TypeORM.

Índice
Estado actual de los repos

Qué se rescata y qué se descarta

Arquitectura objetivo

Fase 1 — Preparar el terreno en back-end-public

Fase 2 — Portar las vistas desde back-end-admin

Fase 3 — Crear los controllers del backoffice

Fase 4 — Roles y permisos

Fase 5 — Configurar nginx (opcional)

Fase 6 — Pruebas

Checklist final

1. Estado actual de los repos
back-end-public (canónico)
Dependencias clave:

@nestjs/typeorm + typeorm + mariadb → DB real

@nestjs/jwt → JWT real

@nestjs/swagger → documentación

bcryptjs → hash de passwords

class-validator + class-transformer → validación

cookie-parser + morgan → cookies y logs

Módulos (src/modules/):

text
auth/                 → JWT + cookie + refresh + sesiones en DB
clubs/                → clubes
database/             → config TypeORM + migraciones
event-registrations/  → inscripciones a eventos
events/               → eventos
gallery-images/       → imágenes de galería
home-statistics/      → estadísticas del home
licenses/             → licencias
map-locations/        → ubicaciones en mapa
modalities/           → modalidades
news-articles/        → noticias
permissions/          → permisos granulares
pilots/               → pilotos
users/                → usuarios
main.ts:

Prefijo global /api

cookieParser() + createCookieSessionMiddleware()

CORS con credentials: true

Swagger en /api/docs

ValidationPipe con whitelist: true

Rutas GET / y GET /administracion reservadas (placeholder)

auth/:

auth.controller.ts

auth.service.ts

cookie-session.middleware.ts

dto/auth.dto.ts

entities/auth-session.entity.ts

permissions/:

entities/permission.entity.ts

permissions.controller.ts

permissions.service.ts

back-end-admin (prototipo)
Dependencias: solo nunjucks + NestJS mínimo. Sin TypeORM, sin DB, sin JWT, sin bcrypt.

Tiene: backoffice Nunjucks con roles fijos (admin, secretaria, tesoreria, comunicacion), layout, partials, macros, access.ts, menu.ts, DevLoginController.

No tiene: persistencia real. Los datos vienen de data/*.seed.ts.

front-end-public (funciona)
React + Vite. Consume /api/* del back-end-public. Configurado con VITE_API_URL=/api.

front-end-admin (legacy)
AdminLTE estático (HTML/CSS/JS). Reemplazado por el backoffice Nunjucks. Se puede archivar.

2. Qué se rescata y qué se descarta
Del back-end-admin — RESCATAR
backoffice/shared/views/ → layout, partials, macros Nunjucks

backoffice/access.ts → matriz de acceso (adaptar a permisos)

backoffice/menu.ts → menú lateral (adaptar a secciones reales)

backoffice/auth/dev-login.controller.ts → solo para desarrollo

Estilos y assets de AdminLTE (si se quieren reutilizar)

Del back-end-admin — DESCARTAR
domain/ → el público tiene módulos reales

data/*.seed.ts → el público usa TypeORM

api/ → el público ya tiene controllers

core/auth/ → el público tiene auth/ real

core/users/ → el público tiene users/ real

Del back-end-public — YA EXISTE, REUTILIZAR
Todos los módulos de negocio (news-articles, clubs, events, pilots, etc.)

auth/ (JWT + cookie + sesiones)

permissions/ (permisos granulares)

database/ (TypeORM)

Swagger, ValidationPipe, CORS, morgan

3. Arquitectura objetivo
text
back-end-public (NestJS)
├── /api/*                    → frontend público (ya existe)
├── /api/docs                 → Swagger (ya existe)
├── /administracion/*         → backoffice Nunjucks (a construir)
│   ├── /login
│   ├── /panel
│   ├── /noticias
│   ├── /clubes
│   ├── /eventos
│   ├── /pilotos
│   ├── /usuarios
│   └── ...
└── /                         → JSON de bienvenida (ya existe)
Reglas:

Todo lo que va a /api/* es JSON (consumido por el frontend React).

Todo lo que va a /administracion/* es HTML (renderizado con Nunjucks).

El backoffice usa los mismos servicios que el API (NewsArticlesService, ClubsService, etc.).

La autenticación del backoffice es la misma del API (JWT + cookie de sesión).

Fase 1 — Preparar el terreno en back-end-public
1.1 Instalar Nunjucks
bash
cd back-end-public
pnpm add nunjucks
pnpm add -D @types/nunjucks
1.2 Crear la estructura de carpetas
bash
mkdir -p src/modules/backoffice/shared/views/partials
mkdir -p src/modules/backoffice/shared/views/macros
mkdir -p src/modules/backoffice/news/views
mkdir -p src/modules/backoffice/clubs/views
mkdir -p src/modules/backoffice/events/views
mkdir -p src/modules/backoffice/pilots/views
mkdir -p src/modules/backoffice/users/views
Estructura resultante:

text
src/modules/backoffice/
├── backoffice.module.ts
├── access.ts
├── menu.ts
├── shared/
│   └── views/
│       ├── layout.njk
│       ├── partials/
│       └── macros/
├── news/
│   ├── news.backoffice.controller.ts
│   └── views/
│       ├── index.njk
│       └── edit.njk
├── clubs/
│   ├── clubs.backoffice.controller.ts
│   └── views/
├── events/
├── pilots/
└── users/
1.3 Configurar el motor de vistas en main.ts
Modificar src/main.ts para:

Usar NestExpressApplication en vez de INestApplication.

Configurar Nunjucks.

Excluir /administracion/* del prefijo global /api.

typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as nunjucks from 'nunjucks';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ... (lo que ya tenés)

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'administracion', method: RequestMethod.ALL },
      { path: 'administracion/(.*)', method: RequestMethod.ALL },
    ],
  });

  // Configurar Nunjucks
  const viewsPath = join(__dirname, 'modules/backoffice/shared/views');
  const njkEnv = nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
    watch: process.env.NODE_ENV !== 'production',
  });

  app.engine('njk', njkEnv.render);
  app.setViewEngine('njk');
  app.setViews(viewsPath);

  // ... (resto igual)
}
Nota importante: el setGlobalPrefix('api') con exclude es clave. Sin esto, el backoffice quedaría en /api/administracion/*, lo cual es raro.

Fase 2 — Portar las vistas desde back-end-admin
2.1 Copiar los archivos base
bash
# Desde la raíz code-favl-org
cp -r back-end-admin/src/modules/backoffice/shared/views/* \
      back-end-public/src/modules/backoffice/shared/views/

cp back-end-admin/src/modules/backoffice/access.ts \
   back-end-public/src/modules/backoffice/access.ts

cp back-end-admin/src/modules/backoffice/menu.ts \
   back-end-public/src/modules/backoffice/menu.ts
2.2 Revisar y adaptar las rutas de los templates
Nunjucks usa rutas relativas al viewsPath. En el back-end-admin, los templates probablemente se referencian como shared/views/layout.njk. En el back-end-public, el viewsPath ya apunta a shared/views/, así que las referencias cambian.

Ejemplo: si en el admin tenés:

njk
{% extends "shared/views/layout.njk" %}
En el público tenés que cambiarlo a:

njk
{% extends "layout.njk" %}
Hacé un grep para encontrar todas las referencias:

bash
grep -rn "shared/views" back-end-public/src/modules/backoffice/
Y reemplazá según corresponda.

2.3 Adaptar access.ts y menu.ts
Estos archivos hoy usan roles fijos (admin, secretaria, tesoreria, comunicacion). En el público hay permisos granulares. Ver Fase 4 para las opciones.

Fase 3 — Crear los controllers del backoffice
3.1 Patrón general
Cada sección del backoffice tiene:

Un controller (*.backoffice.controller.ts) que:

Está bajo /administracion/<seccion>.

Usa el AuthGuard existente.

Llama al service real del módulo (NewsArticlesService, ClubsService, etc.).

Renderiza la vista con res.render('news/index', { ... }).

3.2 Ejemplo: sección noticias
src/modules/backoffice/news/news.backoffice.controller.ts:

typescript
import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard'; // ajustar según el nombre real
import { NewsArticlesService } from '../../news-articles/news-articles.service';

@Controller('administracion/noticias')
@UseGuards(AuthGuard)
export class NewsBackofficeController {
  constructor(private readonly newsService: NewsArticlesService) {}

  @Get()
  @Render('news/index')
  async index() {
    const noticias = await this.newsService.findAll();
    return {
      title: 'Noticias',
      noticias,
      user: null, // viene del guard, ajustar
    };
  }
}
src/modules/backoffice/news/views/index.njk:

njk
{% extends "layout.njk" %}

{% block content %}
  <h1>Noticias</h1>
  <a href="/administracion/noticias/nueva" class="btn btn-primary">Nueva</a>

  <table class="table">
    <thead>
      <tr>
        <th>Título</th>
        <th>Fecha</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {% for noticia in noticias %}
        <tr>
          <td>{{ noticia.title }}</td>
          <td>{{ noticia.createdAt | date }}</td>
          <td>
            <a href="/administracion/noticias/{{ noticia.id }}/editar">Editar</a>
          </td>
        </tr>
      {% endfor %}
    </tbody>
  </table>
{% endblock %}
3.3 Registro de controllers
src/modules/backoffice/backoffice.module.ts:

typescript
import { Module } from '@nestjs/common';
import { NewsArticlesModule } from '../news-articles/news-articles.module';
import { ClubsModule } from '../clubs/clubs.module';
import { NewsBackofficeController } from './news/news.backoffice.controller';
import { ClubsBackofficeController } from './clubs/clubs.backoffice.controller';

@Module({
  imports: [
    NewsArticlesModule,
    ClubsModule,
    // ... demás módulos de negocio que use el backoffice
  ],
  controllers: [
    NewsBackofficeController,
    ClubsBackofficeController,
    // ... demás controllers del backoffice
  ],
})
export class BackofficeModule {}
Registrar en app.module.ts:

typescript
import { BackofficeModule } from './modules/backoffice/backoffice.module';

@Module({
  imports: [
    // ... los existentes
    BackofficeModule,
  ],
})
export class AppModule {}
Importante: BackofficeModule importa los módulos de negocio (NewsArticlesModule, ClubsModule) para reutilizar sus services. No crea servicios nuevos.

Fase 4 — Roles y permisos
Situación actual
back-end-admin: roles fijos (admin, secretaria, tesoreria, comunicacion). El access.ts mapea cada rol a las secciones que puede ver.

back-end-public: permisos granulares (PermissionEntity). Cada usuario tiene permisos individuales.

Opciones
Opción A — Simple: agregar un campo role al User.

Ventaja: rápida, no toca el sistema de permisos.

Desventaja: conviven dos sistemas (rol + permisos).

Opción B — Correcta: roles como agrupaciones de permisos.

Ventaja: un solo sistema.

Desventaja: más trabajo inicial.

Recomendación
Opción B, pero implementada por fases:

Primero, definir los 4 roles del admin como constantes en access.ts.

Crear un RolesService que, dado un usuario, determine su rol según sus permisos.

El access.ts usa el rol resultante.

Mientras tanto, para arrancar rápido, se puede usar Opción A y migrar a B después.

Fase 5 — Configurar nginx (opcional)
Si querés separar el frontend estático (React) del backend:

nginx
server {
  listen 443 ssl;
  server_name favl.org;

  # Frontend público (React compilado)
  root /var/www/front-end-public/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # API
  location /api/ {
    proxy_pass http://back-end-public:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Backoffice
  location /administracion/ {
    proxy_pass http://back-end-public:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
Nota: el backoffice se sirve desde el mismo backend que el API. nginx solo hace de proxy.

Fase 6 — Pruebas
Checklist de pruebas
□ El back-end-public compila (pnpm build).
□ El API sigue funcionando (GET /api/news-articles devuelve JSON).
□ Swagger sigue accesible (GET /api/docs).
□ El frontend público sigue funcionando (carga noticias, clubes, etc.).
□ GET /administracion/login renderiza el formulario de login.
□ Login con un usuario admin funciona (redirige a /administracion/panel).
□ GET /administracion/panel renderiza el panel.
□ Cada sección (/administracion/noticias, /administracion/clubes, etc.) renderiza.
□ El menú lateral se filtra según el rol del usuario.
□ Cerrar sesión funciona.
□ Un usuario sin permiso recibe 403 (no 401).
Checklist final
Preparación
□ pnpm add nunjucks @types/nunjucks en back-end-public.
□ Carpetas src/modules/backoffice/ creadas.
□ main.ts configurado con Nunjucks y setGlobalPrefix con exclude.
□ NestExpressApplication usado en vez de INestApplication.
Port de vistas
□ shared/views/ copiado del admin al público.
□ Rutas de templates revisadas (grep -rn "shared/views").
□ access.ts adaptado.
□ menu.ts adaptado.
Controllers
□ BackofficeModule creado.
□ NewsBackofficeController creado y registrado.
□ ClubsBackofficeController creado y registrado.
□ Resto de secciones creadas (eventos, pilotos, usuarios, etc.).
□ BackofficeModule importado en app.module.ts.
Auth
□ AuthGuard aplicado a los controllers del backoffice.
□ Sistema de roles/permisos mapeado.
□ Login del backoffice funcionando.
□ Logout funcionando.
□ DevLoginController (solo si DEV_LOGIN=true).
Verificación
□ pnpm build pasa.
□ pnpm test pasa.
□ API sigue funcionando.
□ Backoffice funciona en /administracion/*.
□ Frontend público sigue funcionando.
Apéndice: comandos útiles
Ver estructura del backoffice
bash
find back-end-public/src/modules/backoffice -type f | sort
Ver diferencias entre admin y público
bash
diff -r back-end-admin/src/modules/backoffice \
        back-end-public/src/modules/backoffice
Buscar referencias a templates
bash
grep -rn "extends\|include\|import" back-end-public/src/modules/backoffice/shared/views/
Correr en desarrollo
bash
cd back-end-public
pnpm run start:dev
Apéndice: recursos
Nunjucks docs

NestJS + Express view engines

TypeORM docs

NestJS Guards
