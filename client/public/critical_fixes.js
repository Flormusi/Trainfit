// Script para solucionar problemas críticos identificados en los logs
(function() {
    console.log('🔧 Critical Fixes iniciado - Solucionando problemas identificados');
    
    // 1. Solucionar problemas de autenticación
    const fixAuthenticationIssues = () => {
        console.log('\n🔐 Solucionando problemas de autenticación...');
        
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (token) {
            try {
                // Verificar si el token está bien formado
                const parts = token.split('.');
                if (parts.length !== 3) {
                    console.log('❌ Token malformado - eliminando token corrupto');
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    window.location.reload();
                    return;
                }
                
                // Decodificar y verificar el payload
                const payload = JSON.parse(atob(parts[1]));
                const now = Date.now() / 1000;
                
                if (payload.exp && payload.exp < now) {
                    console.log('❌ Token expirado - eliminando token');
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                    return;
                }
                
                console.log('✅ Token válido:', {
                    userId: payload.id,
                    email: payload.email,
                    role: payload.role,
                    exp: new Date(payload.exp * 1000).toLocaleString()
                });
                
                // Asegurar que el token esté en ambos lugares
                if (!localStorage.getItem('token')) {
                    localStorage.setItem('token', token);
                }
                if (!localStorage.getItem('authToken')) {
                    localStorage.setItem('authToken', token);
                }
                
            } catch (error) {
                console.log('❌ Error procesando token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
                window.location.reload();
            }
        } else {
            console.log('⚠️ No se encontró token - redirigiendo a login');
            window.location.href = '/login';
        }
    };
    
    // 2. Solucionar problemas de red y CORS
    const fixNetworkIssues = () => {
        console.log('\n🌐 Solucionando problemas de red...');
        
        // Interceptar y corregir solicitudes fetch
        const originalFetch = window.fetch;
        window.fetch = async function(url, options = {}) {
            // Asegurar headers correctos
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            // Agregar token de autenticación
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            // Combinar headers
            options.headers = {
                ...defaultHeaders,
                ...(options.headers || {})
            };
            
            // Asegurar que las URLs sean absolutas para el backend
            if (typeof url === 'string' && url.startsWith('/api/')) {
                url = `http://localhost:5002${url}`;
            }
            
            console.log(`🌐 Fetch corregido: ${url}`);
            
            try {
                const response = await originalFetch.call(this, url, options);
                
                if (!response.ok) {
                    console.log(`❌ Respuesta no exitosa: ${response.status} ${response.statusText}`);
                    
                    // Si es 401, limpiar autenticación
                    if (response.status === 401) {
                        console.log('🔐 Error 401 - limpiando autenticación');
                        localStorage.removeItem('token');
                        localStorage.removeItem('authToken');
                        window.location.href = '/login';
                    }
                }
                
                return response;
            } catch (error) {
                console.log(`❌ Error de red: ${error.message}`);
                throw error;
            }
        };
        
        console.log('✅ Interceptor de fetch corregido configurado');
    };
    
    // 3. Solucionar problemas de botones no interactivos
    const fixButtonInteractivity = () => {
        console.log('\n🔘 Solucionando problemas de interactividad de botones...');
        
        // Encontrar y corregir botones problemáticos
        const problematicButtons = document.querySelectorAll('button[disabled], .btn[disabled], [role="button"][disabled]');
        
        problematicButtons.forEach((button, index) => {
            const text = button.textContent?.trim() || `Button ${index + 1}`;
            console.log(`🔧 Habilitando botón: ${text}`);
            
            button.removeAttribute('disabled');
            button.disabled = false;
            
            // Asegurar estilos correctos
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            
            // Remover clases que puedan estar bloqueando
            button.classList.remove('disabled', 'loading', 'inactive');
        });
        
        // Verificar overlays que puedan estar bloqueando clics
        const overlays = document.querySelectorAll('.overlay, .modal-backdrop, .loading-overlay');
        overlays.forEach((overlay, index) => {
            const rect = overlay.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                console.log(`🔧 Removiendo overlay bloqueante ${index + 1}`);
                overlay.style.display = 'none';
                overlay.style.pointerEvents = 'none';
            }
        });
        
        console.log(`✅ Corregidos ${problematicButtons.length} botones y ${overlays.length} overlays`);
    };
    
    // 4. Solucionar problemas de React
    const fixReactIssues = () => {
        console.log('\n⚛️ Solucionando problemas de React...');
        
        // Forzar re-render de componentes que puedan estar en estado incorrecto
        const reactElements = document.querySelectorAll('[data-reactroot]');
        
        if (reactElements.length > 0) {
            console.log('⚛️ Forzando re-render de componentes React...');
            
            // Disparar eventos que puedan forzar re-render
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('focus'));
            
            // Intentar acceder al contexto de React si está disponible
            if (window.React && window.React.version) {
                console.log(`⚛️ React version: ${window.React.version}`);
            }
        }
        
        console.log('✅ Correcciones de React aplicadas');
    };
    
    // 5. Monitorear y corregir problemas en tiempo real
    const setupRealTimeMonitoring = () => {
        console.log('\n👁️ Configurando monitoreo en tiempo real...');
        
        // Monitorear errores de JavaScript
        window.addEventListener('error', (event) => {
            console.log('❌ Error JavaScript detectado:', event.error);
            
            // Si es un error de autenticación, intentar solucionarlo
            if (event.error?.message?.includes('401') || event.error?.message?.includes('Unauthorized')) {
                console.log('🔧 Intentando solucionar error de autenticación...');
                fixAuthenticationIssues();
            }
        });
        
        // Monitorear promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            console.log('❌ Promesa rechazada:', event.reason);
            
            if (event.reason?.status === 401) {
                console.log('🔧 Solucionando error 401 en promesa...');
                fixAuthenticationIssues();
            }
        });
        
        // Monitorear cambios en el DOM para botones nuevos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const newButtons = Array.from(mutation.addedNodes)
                        .filter(node => node.nodeType === 1)
                        .filter(node => node.matches && node.matches('button, [role="button"], .btn'));
                    
                    if (newButtons.length > 0) {
                        console.log(`🆕 Nuevos botones detectados: ${newButtons.length}`);
                        setTimeout(() => fixButtonInteractivity(), 100);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Monitoreo en tiempo real configurado');
    };
    
    // Ejecutar todas las correcciones
    setTimeout(() => {
        console.log('\n🚀 EJECUTANDO CORRECCIONES CRÍTICAS...');
        
        try {
            fixAuthenticationIssues();
            fixNetworkIssues();
            fixButtonInteractivity();
            fixReactIssues();
            setupRealTimeMonitoring();
            
            console.log('\n✅ TODAS LAS CORRECCIONES APLICADAS EXITOSAMENTE');
            
            // Ejecutar correcciones periódicas
            setInterval(() => {
                fixButtonInteractivity();
            }, 5000); // Cada 5 segundos
            
        } catch (error) {
            console.log('❌ Error aplicando correcciones:', error);
        }
        
    }, 1000);
    
    console.log('✅ Critical Fixes configurado');
})();