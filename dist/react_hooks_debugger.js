// Script para diagnosticar problemas con hooks de React y estado de componentes
(function() {
    console.log('🔍 React Hooks Debugger iniciado');
    
    // Verificar si React DevTools está disponible
    setTimeout(() => {
        console.log('🔍 Verificando React DevTools y estado de componentes...');
        
        // Intentar acceder a React Fiber para debugging
        const tryGetReactFiber = () => {
            const rootElement = document.getElementById('root');
            if (rootElement) {
                // Buscar propiedades de React Fiber
                const fiberKey = Object.keys(rootElement).find(key => 
                    key.startsWith('__reactFiber') || key.startsWith('_reactInternalFiber')
                );
                
                if (fiberKey) {
                    console.log('✅ React Fiber encontrado:', fiberKey);
                    return rootElement[fiberKey];
                }
            }
            return null;
        };
        
        const fiber = tryGetReactFiber();
        if (fiber) {
            console.log('📊 React Fiber tree disponible');
        } else {
            console.log('❌ No se pudo acceder al React Fiber tree');
        }
        
        // Verificar si hay componentes con errores
        const checkForErrorBoundaries = () => {
            const errorElements = document.querySelectorAll('[data-error], .error-boundary, .error-fallback');
            if (errorElements.length > 0) {
                console.log('🚨 Posibles Error Boundaries detectados:', errorElements.length);
                errorElements.forEach((el, index) => {
                    console.log(`Error Element ${index + 1}:`, el);
                });
            } else {
                console.log('✅ No se detectaron Error Boundaries activos');
            }
        };
        
        checkForErrorBoundaries();
        
        // Verificar si hay elementos con loading states
        const checkLoadingStates = () => {
            const loadingElements = document.querySelectorAll('[data-loading="true"], .loading, .spinner, .skeleton');
            console.log(`⏳ Elementos en estado de carga: ${loadingElements.length}`);
            
            if (loadingElements.length > 0) {
                loadingElements.forEach((el, index) => {
                    console.log(`Loading Element ${index + 1}:`, {
                        tagName: el.tagName,
                        className: el.className,
                        textContent: el.textContent?.substring(0, 50)
                    });
                });
            }
        };
        
        checkLoadingStates();
        
        // Verificar si hay overlays o modales bloqueando la interacción
        const checkOverlays = () => {
            const overlays = document.querySelectorAll('.modal, .overlay, .backdrop, [role="dialog"]');
            console.log(`🎭 Overlays/Modales detectados: ${overlays.length}`);
            
            overlays.forEach((overlay, index) => {
                const style = window.getComputedStyle(overlay);
                console.log(`Overlay ${index + 1}:`, {
                    display: style.display,
                    visibility: style.visibility,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    pointerEvents: style.pointerEvents
                });
            });
        };
        
        checkOverlays();
        
        // Verificar elementos con pointer-events: none
        const checkPointerEvents = () => {
            const allElements = document.querySelectorAll('*');
            let blockedElements = 0;
            
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.pointerEvents === 'none' && el.tagName === 'BUTTON') {
                    blockedElements++;
                    console.log('🚫 Botón con pointer-events: none:', {
                        element: el,
                        text: el.textContent?.trim(),
                        className: el.className
                    });
                }
            });
            
            console.log(`🚫 Elementos bloqueados por pointer-events: ${blockedElements}`);
        };
        
        checkPointerEvents();
        
        // Verificar si hay elementos con z-index alto que puedan estar bloqueando
        const checkZIndexIssues = () => {
            const allElements = document.querySelectorAll('*');
            const highZIndexElements = [];
            
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                const zIndex = parseInt(style.zIndex);
                
                if (zIndex > 1000) {
                    highZIndexElements.push({
                        element: el,
                        zIndex: zIndex,
                        position: style.position,
                        display: style.display
                    });
                }
            });
            
            console.log(`📏 Elementos con z-index alto (>1000): ${highZIndexElements.length}`);
            highZIndexElements.forEach((item, index) => {
                console.log(`High Z-Index ${index + 1}:`, item);
            });
        };
        
        checkZIndexIssues();
        
        // Verificar si React está en modo de desarrollo
        const checkReactMode = () => {
            if (typeof React !== 'undefined' && React.version) {
                console.log(`⚛️ React version: ${React.version}`);
            }
            
            // Verificar si está en modo desarrollo
            const isDevelopment = process?.env?.NODE_ENV === 'development' || 
                                window.location.hostname === 'localhost';
            console.log(`🔧 Modo desarrollo: ${isDevelopment}`);
        };
        
        checkReactMode();
        
        // Verificar si hay errores en el contexto de autenticación
        const checkAuthContext = () => {
            try {
                // Buscar elementos que puedan indicar problemas de autenticación
                const authElements = document.querySelectorAll('[data-auth], .auth-error, .login-required');
                if (authElements.length > 0) {
                    console.log('🔐 Posibles problemas de autenticación detectados:', authElements.length);
                }
                
                // Verificar si hay tokens en localStorage
                const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                console.log(`🔑 Token de autenticación: ${token ? 'Presente' : 'Ausente'}`);
                
            } catch (error) {
                console.log('❌ Error verificando contexto de autenticación:', error);
            }
        };
        
        checkAuthContext();
        
        // Función para probar la interactividad de botones
        const testButtonInteractivity = () => {
            console.log('🧪 Probando interactividad de botones...');
            
            const buttons = document.querySelectorAll('button');
            let interactiveButtons = 0;
            
            buttons.forEach((button, index) => {
                try {
                    // Simular hover
                    const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
                    button.dispatchEvent(hoverEvent);
                    
                    // Verificar si el botón responde a eventos
                    let responded = false;
                    const testClick = () => { responded = true; };
                    
                    button.addEventListener('click', testClick, { once: true });
                    
                    // Simular click
                    const clickEvent = new MouseEvent('click', { bubbles: true });
                    button.dispatchEvent(clickEvent);
                    
                    if (responded || !button.disabled) {
                        interactiveButtons++;
                    }
                    
                    button.removeEventListener('click', testClick);
                    
                } catch (error) {
                    console.log(`❌ Error probando botón ${index + 1}:`, error);
                }
            });
            
            console.log(`🧪 Botones interactivos: ${interactiveButtons}/${buttons.length}`);
        };
        
        testButtonInteractivity();
        
        // Resumen final
        console.log('📋 DIAGNÓSTICO COMPLETO DE REACT HOOKS:');
        console.log('  - Verificar logs anteriores para detalles específicos');
        console.log('  - Si hay elementos bloqueados, revisar CSS y z-index');
        console.log('  - Si hay overlays activos, verificar estado de modales');
        console.log('  - Si hay problemas de autenticación, verificar contexto');
        
    }, 3000);
    
    console.log('✅ React Hooks Debugger configurado');
})();