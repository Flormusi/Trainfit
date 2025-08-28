// Script de detección de errores de JavaScript que bloquean la interactividad
(function() {
    console.log('🔍 JavaScript Error Detector iniciado');
    
    // Contador de errores
    let errorCount = 0;
    let warningCount = 0;
    
    // Interceptar errores de JavaScript
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = function(...args) {
        errorCount++;
        console.log(`🚨 ERROR DETECTADO #${errorCount}:`, ...args);
        
        // Verificar si es un error crítico que puede bloquear la UI
        const errorString = args.join(' ').toLowerCase();
        if (errorString.includes('uncaught') || 
            errorString.includes('syntaxerror') || 
            errorString.includes('referenceerror') ||
            errorString.includes('typeerror')) {
            console.log('⚠️ ERROR CRÍTICO DETECTADO - Puede estar bloqueando la interactividad');
            
            // Mostrar alerta visual
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff4444;
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 10000;
                font-family: monospace;
                font-size: 12px;
                max-width: 300px;
                word-wrap: break-word;
            `;
            errorDiv.innerHTML = `ERROR CRÍTICO: ${args[0]}`;
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }
        
        originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
        warningCount++;
        console.log(`⚠️ WARNING #${warningCount}:`, ...args);
        originalWarn.apply(console, args);
    };
    
    // Interceptar errores no capturados
    window.addEventListener('error', function(event) {
        console.log('🚨 ERROR NO CAPTURADO:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
        
        // Verificar si el error está en archivos de React/componentes
        if (event.filename && (event.filename.includes('ClientDashboard') || 
                              event.filename.includes('react') ||
                              event.filename.includes('chunk'))) {
            console.log('🔴 ERROR EN COMPONENTE REACT - Posible causa de bloqueo de UI');
        }
    });
    
    // Interceptar promesas rechazadas
    window.addEventListener('unhandledrejection', function(event) {
        console.log('🚨 PROMESA RECHAZADA:', event.reason);
        
        // Verificar si es un error de API
        if (event.reason && event.reason.message) {
            const reasonString = event.reason.message.toLowerCase();
            if (reasonString.includes('network') || 
                reasonString.includes('fetch') ||
                reasonString.includes('cors') ||
                reasonString.includes('api')) {
                console.log('🌐 ERROR DE RED/API DETECTADO');
            }
        }
    });
    
    // Verificar si React está cargado correctamente
    setTimeout(() => {
        console.log('🔍 Verificando estado de React...');
        
        if (typeof React === 'undefined') {
            console.log('❌ React no está definido globalmente');
        } else {
            console.log('✅ React está disponible');
        }
        
        // Verificar si hay elementos React en el DOM
        const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
        console.log(`📊 Elementos React encontrados: ${reactElements.length}`);
        
        // Verificar si hay botones en el DOM
        const buttons = document.querySelectorAll('button');
        console.log(`🔘 Botones encontrados: ${buttons.length}`);
        
        // Verificar event listeners en botones
        let buttonsWithListeners = 0;
        buttons.forEach((button, index) => {
            const hasOnClick = button.onclick !== null;
            const hasEventListeners = button.getEventListeners ? 
                Object.keys(button.getEventListeners()).length > 0 : false;
            
            if (hasOnClick || button.getAttribute('onclick')) {
                buttonsWithListeners++;
            }
            
            console.log(`🔘 Botón ${index + 1}:`, {
                text: button.textContent?.trim(),
                hasOnClick,
                disabled: button.disabled,
                style: button.style.pointerEvents,
                className: button.className
            });
        });
        
        console.log(`📊 Botones con event listeners: ${buttonsWithListeners}/${buttons.length}`);
        
        // Resumen de diagnóstico
        console.log('📋 RESUMEN DE DIAGNÓSTICO:');
        console.log(`  - Errores detectados: ${errorCount}`);
        console.log(`  - Warnings detectados: ${warningCount}`);
        console.log(`  - React disponible: ${typeof React !== 'undefined'}`);
        console.log(`  - Elementos React: ${reactElements.length}`);
        console.log(`  - Botones totales: ${buttons.length}`);
        console.log(`  - Botones con listeners: ${buttonsWithListeners}`);
        
        if (errorCount > 0) {
            console.log('🚨 SE DETECTARON ERRORES - Revisar logs anteriores');
        } else {
            console.log('✅ No se detectaron errores críticos');
        }
    }, 2000);
    
    // Verificar cada 5 segundos si hay nuevos errores
    setInterval(() => {
        if (errorCount > 0 || warningCount > 0) {
            console.log(`📊 Estado actual - Errores: ${errorCount}, Warnings: ${warningCount}`);
        }
    }, 5000);
    
    console.log('✅ JavaScript Error Detector configurado correctamente');
})();