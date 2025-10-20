// Script para limpiar caché y forzar recarga completa
console.log('🧹 LIMPIANDO CACHÉ COMPLETO...');

// Limpiar localStorage completo
localStorage.clear();
console.log('✅ localStorage limpiado');

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// Forzar recarga sin caché
console.log('🔄 Recargando página sin caché...');
window.location.reload(true);

// Si el método anterior no funciona, usar este
setTimeout(() => {
  window.location.href = window.location.href + '?nocache=' + Date.now();
}, 1000);