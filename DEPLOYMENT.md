# Despliegue de TrainFit (Frontend + Backend)

Objetivo: habilitar un entorno accesible para el entrenador sin depender de tu `localhost`, con WebSocket y API funcionando.

## Arquitectura
- Frontend: Vite + React (`client/`)
- Backend: Node/Express + Prisma + Socket.IO (`backend/`)
- Base de datos: PostgreSQL

## Recomendación de Hosting
- Frontend: Vercel (simple, rápido para Vite)
- Backend: Render (Web Service, soporta Node + WebSockets). Alternativas: Railway/Fly.io.
- Base de datos: Neon (Postgres serverless) o Railway Postgres

## Paso a Paso

### 1) Base de datos (Neon)
1. Crear proyecto en Neon y obtener `DATABASE_URL` (formato Prisma: `postgresql://user:pass@host/db?schema=public`).
2. Guardar el valor para configurarlo en el backend.

### 2) Backend (Render)
1. Crear un servicio “Web Service” en Render apuntando al repo.
   - Root: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
2. Variables de entorno requeridas:
   - `DATABASE_URL`: URL de Neon (Prisma)
   - `JWT_SECRET`: una cadena segura (por ejemplo 32+ caracteres)
   - `ALLOWED_ORIGINS`: dominios frontend permitidos, separados por coma. Ej.: `https://tu-app-frontend.vercel.app,https://staging-tu-app-frontend.vercel.app`
   - (Opcional) `EMAIL_*`: si usas envío de emails en producción
3. WebSockets: habilitar soporte en Render (los Web Services lo permiten por defecto). Nota: en free tier puede haber “cold start”.
4. Verificar que el backend expone `/api/health` en `https://tu-backend.onrender.com/api/health`.

### 3) Frontend (Vercel)
1. Crear proyecto nuevo en Vercel, seleccionando el directorio `client/`.
2. Configurar variables de entorno:
   - `VITE_API_URL`: `https://tu-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://tu-backend.onrender.com`
3. Build & Output:
   - Build Command: `npm run build`
   - Output: `dist`
4. Desplegar y obtener la URL del sitio (ej.: `https://tu-app-frontend.vercel.app`).
5. Añadir esta URL en `ALLOWED_ORIGINS` del backend.

### 4) Ajustes de CORS y Cookies
- El backend (`app.ts` y `server.ts`) usa `ALLOWED_ORIGINS` para CORS y Socket.IO. Asegúrate de incluir los dominios exactos (incluye `https`).
- Autenticación: el frontend envía `Authorization: Bearer <token>` (localStorage). La cookie `token` que setea el backend tiene `domain: 'localhost'`; en producción puede no guardarse. No bloquea el flujo, pero si prefieres cookies en prod, ajusta el dominio por variable de entorno.

## Checklist de Variables de Entorno

### Backend
- `DATABASE_URL`
- `JWT_SECRET`
- `ALLOWED_ORIGINS` (coma separada; incluye dominio de Vercel y cualquier preview que quieras permitir)
- `PORT` (Render la establece automáticamente; el servidor ya respeta `process.env.PORT`)
- (Opcional) `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

### Frontend
- `VITE_API_URL` (`https://<backend>/api`)
- `VITE_SOCKET_URL` (`https://<backend>`)

## Validación Post-Deploy
1. Backend saludable: `GET https://<backend>/api/health` → `{ status: 'ok' }`
2. Login desde el frontend en Vercel y ver que se recibe token.
3. Calendario: cargar eventos del mes y verificar colores (sesión naranja, rutina rojo, consulta violeta).
4. WebSocket: interacción en tiempo real (mensajes/notificaciones) sin errores de CORS.

## Problemas Comunes y Soluciones
- CORS bloqueado: revisa `ALLOWED_ORIGINS` (debe coincidir exactamente con el dominio del frontend, incluyendo `https`).
- Mixed Content: usa `https` tanto en frontend como backend.
- WebSockets se desconectan en idle: Render free puede “dormir”. Para demos continuas, considera Railway o un plan que no inactive el servicio.
- Cookie no persiste: el `domain: 'localhost'` no aplica en producción; usa el header `Authorization` como hace el frontend o ajusta el dominio por entorno.

## Opcional: Staging
- Crea un servicio backend adicional y un proyecto frontend adicional (ej.: `staging`), con su propio `ALLOWED_ORIGINS` y variables `VITE_*`.

## Entrega rápida (TL;DR)
1) Deploy backend en Render con `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`.
2) Deploy frontend en Vercel con `VITE_API_URL` y `VITE_SOCKET_URL` apuntando al backend.
3) Probar `/api/health`, login y calendario; si algo falla, revisar CORS.