// Script para forzar recarga completa de la página después de actualizar perfil
console.log('🔄 Script de recarga forzada cargado');

// Interceptar el toast de éxito para recargar la página
const originalToastSuccess = window.toast?.success;
if (originalToastSuccess) {
  window.toast.success = function(message) {
    console.log('✅ Toast de éxito interceptado:', message);
    
    // Llamar al toast original
    const result = originalToastSuccess.apply(this, arguments);
    
    // Si es el mensaje de perfil actualizado, recargar la página
    if (message && message.includes('Perfil actualizado')) {
      console.log('🔄 Perfil actualizado detectado, recargando página en 2 segundos...');
      setTimeout(() => {
        console.log('🔄 Recargando página ahora...');
        window.location.reload();
      }, 2000);
    }
    
    return result;
  };
  console.log('✅ Interceptor de toast configurado');
} else {
  console.log('⚠️ Toast no encontrado, configurando listener alternativo');
  
  // Listener alternativo para detectar cambios en el DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Buscar elementos de toast o notificación
        const toastElements = document.querySelectorAll('[class*="toast"], [class*="notification"], [class*="alert"]');
        toastElements.forEach((element) => {
          if (element.textContent && element.textContent.includes('Perfil actualizado')) {
            console.log('🔄 Mensaje de éxito detectado, recargando página...');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        });
      }
    });
  });
  
  // Observar cambios en el body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  console.log('👀 Observer de DOM configurado');
}

// Función manual para forzar recarga
window.forcePageReload = function() {
  console.log('🔄 Forzando recarga manual de la página...');
  window.location.reload();
};

console.log('✅ Script de recarga forzada listo. Usa forcePageReload() para recargar manualmente.');
console.log('📝 La página se recargará automáticamente cuando se actualice el perfil.');