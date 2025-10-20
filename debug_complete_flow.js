// Script de depuración completa para verificar el flujo de datos
console.log('🔍 Iniciando depuración completa del flujo de datos...');

// 1. Verificar si estamos en la página correcta
const currentPath = window.location.pathname;
console.log('📍 Ruta actual:', currentPath);

// 2. Verificar autenticación
const token = localStorage.getItem('token');
console.log('🔑 Token presente:', !!token);
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('👤 Usuario autenticado:', payload);
  } catch (e) {
    console.error('❌ Error al decodificar token:', e);
  }
}

// 3. Interceptar llamadas a la API
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/trainer/clients')) {
    console.log('🌐 Interceptando llamada a:', url);
    return originalFetch.apply(this, args).then(response => {
      const clonedResponse = response.clone();
      clonedResponse.json().then(data => {
        console.log('📦 Respuesta de /trainer/clients:', data);
        
        // Analizar estructura
        if (data && data.data && data.data.clients) {
          console.log('✅ Estructura anidada detectada: data.data.clients');
          console.log('👥 Número de clientes:', data.data.clients.length);
          console.log('📋 Clientes:', data.data.clients);
        } else if (Array.isArray(data)) {
          console.log('✅ Array directo detectado');
          console.log('👥 Número de clientes:', data.length);
          console.log('📋 Clientes:', data);
        } else {
          console.log('❓ Estructura desconocida:', data);
        }
      }).catch(e => console.error('❌ Error al parsear respuesta:', e));
      
      return response;
    });
  }
  return originalFetch.apply(this, args);
};

// 4. Función para verificar el DOM
function checkDOM() {
  console.log('🔍 Verificando DOM...');
  
  // Verificar sección de clientes
  const clientsSection = document.querySelector('[class*="client"]') || 
                        document.querySelector('h2, h3, h4').parentElement;
  console.log('📋 Sección de clientes encontrada:', !!clientsSection);
  
  // Verificar tarjetas de cliente
  const clientCards = document.querySelectorAll('[class*="card"], [class*="client"], .bg-white');
  console.log('🃏 Tarjetas de cliente encontradas:', clientCards.length);
  
  // Verificar texto "No hay clientes"
  const noClientsText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('No hay clientes')
  );
  console.log('❌ Mensaje "No hay clientes" presente:', !!noClientsText);
  
  // Verificar estado de carga
  const loadingText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('Cargando')
  );
  console.log('⏳ Estado de carga presente:', !!loadingText);
  
  return {
    clientsSection: !!clientsSection,
    clientCards: clientCards.length,
    noClientsText: !!noClientsText,
    loadingText: !!loadingText
  };
}

// 5. Función para verificar React state
function checkReactState() {
  console.log('⚛️ Verificando estado de React...');
  
  // Buscar el componente TrainerDashboard
  const dashboardElement = document.querySelector('[class*="dashboard"], main, .container');
  if (dashboardElement && dashboardElement._reactInternalFiber) {
    console.log('🎯 Componente React encontrado');
    // Intentar acceder al estado (esto puede no funcionar en producción)
    try {
      const fiber = dashboardElement._reactInternalFiber;
      console.log('🔧 Fiber:', fiber);
    } catch (e) {
      console.log('❌ No se puede acceder al estado de React en producción');
    }
  }
}

// 6. Ejecutar verificaciones
setTimeout(() => {
  console.log('🚀 Ejecutando verificaciones...');
  const domStatus = checkDOM();
  checkReactState();
  
  console.log('📊 Resumen de verificación DOM:', domStatus);
}, 2000);

// 7. Verificar cada 5 segundos
setInterval(() => {
  const domStatus = checkDOM();
  if (domStatus.clientCards > 0) {
    console.log('🎉 ¡Clientes detectados en el DOM!');
  } else if (domStatus.noClientsText) {
    console.log('⚠️ Mensaje "No hay clientes" detectado');
  } else if (domStatus.loadingText) {
    console.log('⏳ Aún cargando...');
  }
}, 5000);

console.log('✅ Script de depuración completa cargado. Monitoreo activo...');