// Script para depurar la actualización del peso en el dashboard
console.log('🔍 Iniciando depuración de actualización de peso...');

// 1. Verificar el estado actual del componente
function checkCurrentState() {
  console.log('📊 Estado actual del dashboard:');
  
  // Buscar el elemento del peso
  const weightElement = document.querySelector('.metric-value');
  if (weightElement) {
    console.log('✅ Elemento de peso encontrado:', weightElement.textContent);
  } else {
    console.log('❌ Elemento de peso no encontrado');
  }
  
  // Verificar si hay datos en localStorage
  const authData = localStorage.getItem('authData');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('💾 Datos de auth en localStorage:', parsed);
    } catch (e) {
      console.log('❌ Error al parsear authData:', e);
    }
  }
  
  // Verificar sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  console.log('🗂️ Claves en sessionStorage:', sessionKeys);
}

// 2. Interceptar llamadas a la API
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/api/')) {
    console.log('🌐 API Call:', url, args[1]);
  }
  return originalFetch.apply(this, args).then(response => {
    if (typeof url === 'string' && url.includes('/profile')) {
      console.log('📥 Profile API Response:', response.status);
      response.clone().json().then(data => {
        console.log('📄 Profile Data:', data);
      }).catch(() => {});
    }
    return response;
  });
};

// 3. Monitorear cambios en el DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const weightElements = document.querySelectorAll('.metric-value');
      weightElements.forEach((el, index) => {
        if (el.textContent.includes('kg')) {
          console.log(`⚖️ Peso actualizado en elemento ${index}:`, el.textContent);
        }
      });
    }
  });
});

// Observar cambios en el dashboard
const dashboard = document.querySelector('.client-dashboard-page');
if (dashboard) {
  observer.observe(dashboard, {
    childList: true,
    subtree: true,
    characterData: true
  });
  console.log('👀 Observer configurado en el dashboard');
}

// 4. Función para forzar actualización manual
window.forceWeightUpdate = function() {
  console.log('🔄 Forzando actualización manual...');
  
  // Disparar evento personalizado
  window.dispatchEvent(new CustomEvent('forceProfileReload'));
  
  // Intentar recargar datos directamente
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('⚛️ Intentando forzar re-render de React...');
    // Forzar actualización de React
    const reactRoot = document.querySelector('.client-dashboard-page');
    if (reactRoot && reactRoot._reactInternalFiber) {
      console.log('🔄 Forzando actualización de componente React');
    }
  }
};

// Ejecutar verificación inicial
checkCurrentState();

console.log('✅ Script de depuración cargado. Usa forceWeightUpdate() para forzar actualización.');
console.log('📝 Monitorea los logs para ver las llamadas a la API y cambios en el DOM.');