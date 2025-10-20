# Herramientas de Depuración de API para TrainFit

Este directorio contiene varios scripts para depurar y verificar el funcionamiento correcto de la API de TrainFit. Estos scripts son útiles para diagnosticar problemas de comunicación entre el frontend y el backend.

## Scripts Disponibles

### 1. `debug_api_response.js`

Script básico para depurar la respuesta de la API de clientes. Utiliza un token de autenticación almacenado en `token.txt` para hacer solicitudes a la API.

**Uso:**
```bash
node debug_api_response.js
```

### 2. `debug_api_improved.js`

Versión mejorada del script de depuración que proporciona información más detallada sobre las respuestas de la API. Incluye funciones para obtener clientes, datos del dashboard y analíticas.

**Uso:**
```bash
node debug_api_improved.js
```

### 3. `verify_api_structure.js`

Script específico para verificar que la estructura de la respuesta de la API coincide con lo esperado por el frontend, especialmente por el componente `TrainerDashboard.tsx`.

**Uso:**
```bash
node verify_api_structure.js
```

## Generación de Token de Autenticación

Para que estos scripts funcionen correctamente, necesitas un token de autenticación válido. Puedes generarlo usando el script `test_api_with_token.js` en el directorio del backend:

```bash
cd ../backend
node test_api_with_token.js
```

Este script generará un token JWT válido para el usuario `magagroca@gmail.com` y lo guardará en `../client/src/token.txt`.

## Solución de Problemas Comunes

### Error 401 (Not authorized to access this route)

Este error puede ocurrir por varias razones:

1. **Token expirado**: Los tokens JWT tienen un tiempo de expiración (generalmente 1 hora). Si recibes este error, genera un nuevo token con `test_api_with_token.js`.

2. **Token mal formado**: Asegúrate de que el token en `token.txt` esté completo y no tenga espacios o saltos de línea adicionales.

3. **Problema con la clave secreta**: Si el backend usa una clave secreta diferente a la que se usó para generar el token, la verificación fallará. Asegúrate de que `JWT_SECRET` sea consistente.

### Error en la estructura de la respuesta

Si el frontend espera una estructura diferente a la que devuelve el backend, puedes usar `verify_api_structure.js` para identificar las discrepancias. Compara la salida con lo que espera el componente `TrainerDashboard.tsx`.

## Notas Importantes

- Estos scripts son solo para depuración y no deben usarse en producción.
- Los tokens generados contienen información sensible, no los compartas ni los subas a repositorios públicos.
- Si modificas la estructura de la API en el backend, asegúrate de actualizar también el frontend para mantener la compatibilidad.

## Ejemplo de Flujo de Depuración

1. Genera un token válido con `test_api_with_token.js`
2. Verifica la estructura de la API con `verify_api_structure.js`
3. Si hay problemas, usa `debug_api_improved.js` para obtener información detallada
4. Compara la respuesta con lo que espera el frontend en `TrainerDashboard.tsx`
5. Realiza las correcciones necesarias en el backend o frontend

---

Creado para ayudar en la depuración de la aplicación TrainFit.