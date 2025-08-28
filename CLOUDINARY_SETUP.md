# Configuración de Cloudinary para TrainFit

## ¿Qué es Cloudinary?

Cloudinary es un servicio de gestión de imágenes en la nube que ofrece:
- Optimización automática de imágenes
- Transformaciones en tiempo real
- CDN global para carga rápida
- Formatos automáticos (WebP, AVIF)
- Compresión inteligente

## Configuración Inicial

### 1. Crear cuenta en Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita
3. Anota tu **Cloud Name** del dashboard

### 2. Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y agrega tu configuración:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
   VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset_aqui
   ```

### 3. Crear Upload Preset (Opcional)

Si planeas subir imágenes desde la aplicación:

1. Ve a Settings > Upload en tu dashboard de Cloudinary
2. Scroll hasta "Upload presets"
3. Crea un nuevo preset:
   - **Upload preset name**: `trainfit_exercises`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `exercises`
   - **Access Mode**: `Public`

## Estructura de Carpetas Recomendada

```
tu_cloud_name/
├── exercises/
│   ├── biceps/
│   │   ├── curl_barra
│   │   ├── curl_mancuernas
│   │   └── curl_martillo
│   ├── triceps/
│   │   ├── press_frances
│   │   ├── extensiones_polea
│   │   └── fondos_paralelas
│   ├── cardio/
│   │   ├── eliptico
│   │   ├── cinta
│   │   └── bici
│   └── ...
```

## Subir Imágenes

### Opción 1: Dashboard de Cloudinary

1. Ve a Media Library en tu dashboard
2. Crea las carpetas según la estructura recomendada
3. Sube las imágenes manteniendo los nombres consistentes

### Opción 2: Bulk Upload

1. Organiza tus imágenes localmente según la estructura
2. Usa la herramienta de bulk upload de Cloudinary
3. Mantén los nombres de archivo consistentes con el mapeo en `cloudinaryService.ts`

## Actualizar Mapeo de Ejercicios

Edita el archivo `src/services/cloudinaryService.ts` y actualiza el objeto `exerciseImageMap`:

```typescript
export const exerciseImageMap: Record<string, string> = {
  'Curl de bíceps con barra': 'exercises/biceps/curl_barra',
  'Curl de bíceps con mancuernas': 'exercises/biceps/curl_mancuernas',
  // Agrega más ejercicios aquí...
};
```

## Uso en Componentes

### Opción 1: Usar el componente ExerciseImage

```tsx
import ExerciseImage from '../components/ExerciseImage';

<ExerciseImage 
  exerciseName="Curl de bíceps con barra"
  width={300}
  height={200}
  className="rounded-lg"
/>
```

### Opción 2: Usar el servicio directamente

```tsx
import { getExerciseImageUrl } from '../services/cloudinaryService';

const imageUrl = getExerciseImageUrl('Curl de bíceps con barra', 300, 200);
```

## Beneficios de esta Implementación

1. **Optimización automática**: Las imágenes se optimizan según el dispositivo
2. **Carga rápida**: CDN global de Cloudinary
3. **Fallback inteligente**: Si no hay imagen en Cloudinary, usa placeholder local
4. **Escalabilidad**: Fácil agregar nuevos ejercicios
5. **Mantenimiento**: Centralizado en un solo servicio

## Plan Gratuito de Cloudinary

- **Almacenamiento**: 25 GB
- **Ancho de banda**: 25 GB/mes
- **Transformaciones**: 25,000/mes
- **Más que suficiente para TrainFit**

## Próximos Pasos

1. Configurar tu cuenta de Cloudinary
2. Subir las imágenes de ejercicios
3. Actualizar el mapeo en `cloudinaryService.ts`
4. Probar la aplicación
5. Migrar gradualmente otros archivos de ejercicios

## Troubleshooting

### Imágenes no cargan
- Verifica que `VITE_CLOUDINARY_CLOUD_NAME` esté configurado
- Confirma que las imágenes existen en Cloudinary
- Revisa la consola del navegador para errores

### Imágenes lentas
- Cloudinary optimiza automáticamente, pero puede tomar tiempo la primera carga
- Las siguientes cargas serán desde cache

### Cuota excedida
- El plan gratuito es generoso, pero monitorea el uso
- Considera optimizar el tamaño de las imágenes originales