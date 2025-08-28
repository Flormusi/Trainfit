// Script de diagnóstico silencioso - Mantiene funcionalidad sin console.log
(function() {
    // Configuración silenciosa
    const SILENT_MODE = true;
    const log = SILENT_MODE ? () => {} : console.log;
    
    // 1. Detector de errores críticos (silencioso)
    let errorCount = 0;
    const originalError = console.error;
    
    console.error = function(...args) {
        errorCount++;
        const errorString = args.join(' ').toLowerCase();
        
        if (errorString.includes('uncaught') || 
            errorString.includes('syntaxerror') || 
            errorString.includes('referenceerror') ||
            errorString.includes('typeerror')) {
            
            // Solo mostrar errores críticos visualmente
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
        
        return originalError.apply(console, args);
    };
    
    // 2. Correcciones críticas (silenciosas)
    const fixAuthenticationIssues = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (token) {
            try {
                const parts = token.split('.');
                if (parts.length !== 3) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    window.location.reload();
                    return;
                }
                
                const payload = JSON.parse(atob(parts[1]));
                const now = Date.now() / 1000;
                
                if (payload.exp && payload.exp < now) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    window.location.reload();
                    return;
                }
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
            }
        }
    };
    
    // 3. Interceptor de red (silencioso)
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        if (typeof url === 'string' && url.startsWith('/api/')) {
            url = `http://localhost:5002${url}`;
        }
        
        if (!options.headers) {
            options.headers = {};
        }
        
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token && !options.headers['Authorization']) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (!options.headers['Content-Type'] && options.method !== 'GET') {
            options.headers['Content-Type'] = 'application/json';
        }
        
        return originalFetch(url, options).catch(error => {
            if (error.message.includes('401')) {
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
            throw error;
        });
    };
    
    // 4. Corrección de botones (silenciosa)
    const fixButtonInteractivity = () => {
        const buttons = document.querySelectorAll('button[disabled], button[style*="pointer-events: none"]');
        buttons.forEach(button => {
            if (button.textContent.includes('Ver detalles') || 
                button.textContent.includes('Solicitar cambio') ||
                button.textContent.includes('Editar')) {
                button.disabled = false;
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
            }
        });
        
        // Remover overlays que bloqueen interacción
        const overlays = document.querySelectorAll('[style*="pointer-events: none"]');
        overlays.forEach(overlay => {
            if (overlay.style.position === 'absolute' || overlay.style.position === 'fixed') {
                overlay.style.display = 'none';
            }
        });
    };
    
    // 5. Corrección de event listeners (silenciosa)
    const fixEventListeners = () => {
        const dashboardButtons = document.querySelectorAll('.btn-primary, .btn-calendar-action, .edit-profile-btn');
        
        dashboardButtons.forEach(button => {
            if (!button.onclick && !button.getAttribute('data-fixed')) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Trigger React event
                    const reactEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    
                    this.dispatchEvent(reactEvent);
                });
                
                button.setAttribute('data-fixed', 'true');
            }
        });
    };
    
    // Ejecutar correcciones iniciales
    fixAuthenticationIssues();
    
    // Observador para aplicar correcciones dinámicamente
    const observer = new MutationObserver(() => {
        fixButtonInteractivity();
        fixEventListeners();
    });
    
    // Iniciar observación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['disabled', 'style']
            });
            
            // Aplicar correcciones iniciales
            setTimeout(() => {
                fixButtonInteractivity();
                fixEventListeners();
            }, 1000);
        });
    } else {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'style']
        });
        
        // Aplicar correcciones iniciales
        setTimeout(() => {
            fixButtonInteractivity();
            fixEventListeners();
        }, 1000);
    }
    
    // Aplicar correcciones periódicamente
    setInterval(() => {
        fixButtonInteractivity();
        fixEventListeners();
    }, 5000);
    
    // Exponer funciones para debugging manual (sin logs)
    window.silentDiagnostics = {
        fixAuth: fixAuthenticationIssues,
        fixButtons: fixButtonInteractivity,
        fixListeners: fixEventListeners,
        getErrorCount: () => errorCount
    };
    
})();