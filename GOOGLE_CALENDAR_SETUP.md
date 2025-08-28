# Configuración de Google Calendar API

Esta guía te ayudará a configurar la integración con Google Calendar para sincronizar los entrenamientos de tus clientes.

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a Google Cloud Console
- El proyecto TrainFit ejecutándose localmente

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en "Seleccionar proyecto" en la parte superior
3. Clic en "Nuevo proyecto"
4. Nombra tu proyecto (ej: "TrainFit Calendar Integration")
5. Haz clic en "Crear"

### 2. Habilitar Google Calendar API

1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca "Google Calendar API"
3. Haz clic en "Google Calendar API"
4. Presiona el botón **"HABILITAR"**

### 3. Configurar Pantalla de Consentimiento OAuth

1. Ve a **"APIs y servicios" > "Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** como tipo de usuario
3. Completa la información requerida:
   - **Nombre de la aplicación**: TrainFit
   - **Correo electrónico de asistencia**: tu email
   - **Dominio autorizado**: localhost (para desarrollo)
   - **Correo electrónico del desarrollador**: tu email
4. Haz clic en **"Guardar y continuar"**
5. En "Alcances", haz clic en **"Agregar o quitar alcances"**
6. Busca y selecciona:
   - `https://www.googleapis.com/auth/calendar`
7. Haz clic en **"Actualizar"** y luego **"Guardar y continuar"**
8. En "Usuarios de prueba", agrega tu email y el de los usuarios que probarán la app
9. Haz clic en **"Guardar y continuar"**

### 4. Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth 2.0"**
4. Configura:
   - **Tipo de aplicación**: Aplicación web
   - **Nombre**: TrainFit Web Client
   - **URIs de redirección autorizados**: 
     ```
     http://localhost:5173/auth/google/callback
     ```
5. Haz clic en **"Crear"**
6. **¡IMPORTANTE!** Copia el **ID de cliente** y **Secreto del cliente**

### 5. Configurar Variables de Entorno

1. Abre el archivo `/client/.env` en tu proyecto
2. Reemplaza las siguientes líneas con tus credenciales reales:

```env
# Reemplaza con tus credenciales reales de Google
VITE_GOOGLE_CLIENT_ID=tu_client_id_real_aqui
VITE_GOOGLE_CLIENT_SECRET=tu_client_secret_real_aqui
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### 6. Reiniciar el Servidor de Desarrollo

```bash
# En la terminal del cliente
cd client
npm run dev
```

## ✅ Verificar la Integración

1. Abre tu aplicación en `http://localhost:5173`
2. Inicia sesión como cliente
3. Ve al dashboard del cliente
4. Busca la sección "Integración con Google Calendar"
5. Haz clic en **"Conectar con Google Calendar"**
6. Deberías ser redirigido a Google para autorizar la aplicación
7. Después de autorizar, deberías ver "Estado: Conectado"
8. Haz clic en **"Sincronizar Entrenamientos"** para probar

## 🔧 Funcionalidades Disponibles

### Para los Clientes:
- **Conectar cuenta**: Vincula su Google Calendar personal
- **Sincronizar entrenamientos**: Crea eventos automáticamente
- **Recordatorios**: Email (1 día antes) y popup (30 min antes)
- **Desconectar**: Revoca el acceso cuando sea necesario

### Para los Entrenadores:
- Los entrenamientos programados se sincronizan automáticamente
- Los clientes pueden ver sus entrenamientos en su calendario personal
- Mejor organización y recordatorios automáticos

## 🚨 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que el URI de redirección en Google Cloud Console sea exactamente:
  `http://localhost:5173/auth/google/callback`

### Error: "invalid_client"
- Verifica que el CLIENT_ID y CLIENT_SECRET sean correctos
- Asegúrate de que no haya espacios extra en el archivo .env

### Error: "access_denied"
- El usuario canceló la autorización
- Verifica que el usuario esté en la lista de "Usuarios de prueba"

### La sincronización no funciona
- Verifica que la Google Calendar API esté habilitada
- Revisa la consola del navegador para errores
- Asegúrate de que el usuario haya autorizado el alcance de Calendar

## 🔒 Seguridad

- **Nunca** compartas tus credenciales de Google
- **Nunca** subas el archivo `.env` a repositorios públicos
- Los tokens se almacenan localmente en el navegador del usuario
- Los usuarios pueden revocar el acceso en cualquier momento

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs de la consola del navegador
2. Verifica que todas las URLs coincidan exactamente
3. Asegúrate de que la API esté habilitada
4. Confirma que el usuario esté en la lista de prueba

¡La integración con Google Calendar está lista para usar! 🎉