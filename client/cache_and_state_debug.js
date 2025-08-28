// Script para diagnosticar problemas de caché y estado en React
// Ejecutar en la consola del navegador

console.log('🔧 Iniciando diagnóstico de caché y estado...');

// 1. Función para limpiar todos los tipos de caché
function clearAllCaches() {
  console.log('\n=== LIMPIANDO CACHÉS ===');
  
  // Limpiar localStorage
  const localStorageKeys = Object.keys(localStorage);
  console.log('📦 LocalStorage keys antes:', localStorageKeys);
  localStorage.clear();
  console.log('✅ LocalStorage limpiado');
  
  // Limpiar sessionStorage
  const sessionStorageKeys = Object.keys(sessionStorage);
  console.log('📦 SessionStorage keys antes:', sessionStorageKeys);
  sessionStorage.clear();
  console.log('✅ SessionStorage limpiado');
  
  // Limpiar caché de Service Worker si existe
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('✅ Service Worker desregistrado');
      });
    });
  }
  
  // Limpiar caché de la aplicación
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('📦 Cachés encontrados:', cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Eliminando caché:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ Todos los cachés eliminados');
    });
  }
}

// 2. Función para verificar el estado de React DevTools
function checkReactDevTools() {
  console.log('\n=== VERIFICANDO REACT DEVTOOLS ===');
  
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('⚛️ React DevTools detectado');
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    // Intentar obtener información de los componentes
    if (hook.renderers && hook.renderers.size > 0) {
      console.log('🔍 Renderers encontrados:', hook.renderers.size);
      
      hook.renderers.forEach((renderer, id) => {
        console.log(`Renderer ${id}:`, renderer);
        
        // Intentar encontrar el componente ClientDashboard
        if (renderer.findFiberByHostInstance) {
          const dashboardElement = document.querySelector('.client-dashboard-page');
          if (dashboardElement) {
            const fiber = renderer.findFiberByHostInstance(dashboardElement);
            if (fiber) {
              console.log('🎯 Fiber del ClientDashboard encontrado:', fiber);
              console.log('📊 Props del componente:', fiber.memoizedProps);
              console.log('🔄 Estado del componente:', fiber.memoizedState);
            }
          }
        }
      });
    }
  } else {
    console.log('❌ React DevTools no detectado');
  }
}

// 3. Función para verificar el estado de Vite/HMR
function checkViteHMR() {
  console.log('\n=== VERIFICANDO VITE HMR ===');
  
  if (window.__vite_plugin_react_preamble_installed__) {
    console.log('⚡ Vite React plugin detectado');
  }
  
  if (import.meta && import.meta.hot) {
    console.log('🔥 HMR activo:', import.meta.hot);
    
    // Forzar actualización HMR
    if (import.meta.hot.send) {
      import.meta.hot.send('vite:invalidate', { path: '/src/pages/ClientDashboard/ClientDashboard.tsx' });
      console.log('🔄 Invalidación HMR enviada');
    }
  } else {
    console.log('❌ HMR no disponible');
  }
}

// 4. Función para verificar errores de JavaScript
function checkJavaScriptErrors() {
  console.log('\n=== VERIFICANDO ERRORES DE JAVASCRIPT ===');
  
  // Interceptar errores
  const originalError = window.onerror;
  const errors = [];
  
  window.onerror = function(message, source, lineno, colno, error) {
    const errorInfo = {
      message,
      source,
      lineno,
      colno,
      error: error ? error.stack : null,
      timestamp: new Date().toISOString()
    };
    
    errors.push(errorInfo);
    console.error('🚨 Error JavaScript capturado:', errorInfo);
    
    if (originalError) {
      originalError.apply(this, arguments);
    }
  };
  
  // Interceptar promesas rechazadas
  window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Promesa rechazada:', event.reason);
    errors.push({
      type: 'unhandledrejection',
      reason: event.reason,
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('✅ Interceptores de errores instalados');
  
  return errors;
}

// 5. Función para verificar el estado de la red
function checkNetworkState() {
  console.log('\n=== VERIFICANDO ESTADO DE LA RED ===');
  
  console.log('🌐 Navigator online:', navigator.onLine);
  console.log('🔗 Connection:', navigator.connection || 'No disponible');
  
  // Verificar si hay requests pendientes
  if (window.performance && window.performance.getEntriesByType) {
    const networkEntries = window.performance.getEntriesByType('navigation');
    console.log('📊 Entradas de navegación:', networkEntries);
    
    const resourceEntries = window.performance.getEntriesByType('resource');
    const recentEntries = resourceEntries.filter(entry => 
      Date.now() - entry.startTime < 30000 // Últimos 30 segundos
    );
    console.log('📦 Recursos recientes:', recentEntries.length);
  }
}

// 6. Función para forzar re-hidratación de React
function forceReactRehydration() {
  console.log('\n=== FORZANDO RE-HIDRATACIÓN DE REACT ===');
  
  // Intentar encontrar el root de React
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Disparar eventos que podrían forzar re-render
    const events = ['focus', 'blur', 'resize', 'scroll'];
    
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      rootElement.dispatchEvent(event);
      window.dispatchEvent(event);
    });
    
    console.log('🔄 Eventos de re-hidratación disparados');
  }
  
  // Forzar actualización del viewport
  if (window.visualViewport) {
    window.visualViewport.dispatchEvent(new Event('resize'));
  }
}

// 7. Función para verificar el estado de autenticación
function checkAuthState() {
  console.log('\n=== VERIFICANDO ESTADO DE AUTENTICACIÓN ===');
  
  // Verificar tokens en localStorage
  const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
  console.log('🔑 Token de autenticación:', authToken ? 'Presente' : 'Ausente');
  
  // Verificar cookies
  console.log('🍪 Cookies:', document.cookie);
  
  // Verificar si hay contexto de autenticación
  const authContext = window.__AUTH_CONTEXT__ || window.authContext;
  if (authContext) {
    console.log('👤 Contexto de autenticación:', authContext);
  }
}

// 8. Función principal de diagnóstico
function runCacheAndStateDiagnosis() {
  console.log('🚀 Ejecutando diagnóstico de caché y estado...');
  
  const errors = checkJavaScriptErrors();
  checkReactDevTools();
  checkViteHMR();
  checkNetworkState();
  checkAuthState();
  
  console.log('\n📋 Resumen del diagnóstico:');
  console.log('- Errores capturados:', errors.length);
  console.log('- React DevTools:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ? 'Disponible' : 'No disponible');
  console.log('- HMR:', (import.meta && import.meta.hot) ? 'Activo' : 'Inactivo');
  console.log('- Red:', navigator.onLine ? 'Online' : 'Offline');
  
  return {
    errors,
    clearAllCaches,
    forceReactRehydration,
    checkReactDevTools,
    checkViteHMR
  };
}

// 9. Función de reparación automática
function autoRepair() {
  console.log('\n🔧 Iniciando reparación automática...');
  
  // Paso 1: Limpiar cachés
  clearAllCaches();
  
  // Paso 2: Forzar re-hidratación
  setTimeout(() => {
    forceReactRehydration();
  }, 1000);
  
  // Paso 3: Recargar la página después de un delay
  setTimeout(() => {
    console.log('🔄 Recargando página...');
    window.location.reload();
  }, 3000);
}

// Exportar funciones globalmente
window.cacheAndStateDebug = {
  runCacheAndStateDiagnosis,
  clearAllCaches,
  forceReactRehydration,
  checkReactDevTools,
  checkViteHMR,
  checkNetworkState,
  checkAuthState,
  autoRepair
};

console.log('\n🎯 Script de caché y estado cargado. Usa las siguientes funciones:');
console.log('- cacheAndStateDebug.runCacheAndStateDiagnosis() - Diagnóstico completo');
console.log('- cacheAndStateDebug.clearAllCaches() - Limpiar todos los cachés');
console.log('- cacheAndStateDebug.forceReactRehydration() - Forzar re-hidratación');
console.log('- cacheAndStateDebug.autoRepair() - Reparación automática');

// Auto-ejecutar diagnóstico
runCacheAndStateDiagnosis();