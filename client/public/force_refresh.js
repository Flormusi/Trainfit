// Script para forzar la recarga completa y limpiar cache
(function() {
    // Limpiar cache del navegador
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) {
                caches.delete(name);
            });
        });
    }
    
    // Forzar recarga completa
    setTimeout(() => {
        window.location.reload(true);
    }, 100);
})();

console.log('🔄 Forzando recarga completa y limpieza de cache...');