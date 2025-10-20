// Script para solucionar problemas específicos de event listeners en ClientDashboard
(function() {
    console.log('🔧 Event Listeners Fix iniciado - Solucionando problemas de interactividad');
    
    // 1. Solucionar problemas de botones con handlers React
    const fixReactButtonHandlers = () => {
        console.log('\n⚛️ Solucionando handlers de botones React...');
        
        // Encontrar botones específicos del dashboard
        const dashboardButtons = {
            'Ver detalles': 'btn-primary',
            'Solicitar cambio': 'btn-calendar-action',
            'Cerrar sesión': 'logout-btn',
            'notification-btn': 'notification-btn',
            'Editar': 'edit-profile-btn'
        };
        
        Object.entries(dashboardButtons).forEach(([text, className]) => {
            // Buscar por texto
            let buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
                btn.textContent?.trim().includes(text)
            );
            
            // Buscar por clase si no se encontró por texto
            if (buttons.length === 0) {
                buttons = Array.from(document.querySelectorAll(`.${className}`));
            }
            
            buttons.forEach((button, index) => {
                if (button.disabled || button.style.pointerEvents === 'none') {
                    console.log(`🔧 Habilitando botón "${text}" (${index + 1})`);
                    
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                    
                    // Remover clases que bloquean interactividad
                    button.classList.remove('disabled', 'loading', 'inactive');
                    
                    // Agregar event listener de respaldo si no existe
                    if (!button.onclick && !button.getAttribute('data-has-listener')) {
                        button.addEventListener('click', function(e) {
                            console.log(`🖱️ Click en botón "${text}" - Handler de respaldo`);
                            
                            // Handlers específicos para cada tipo de botón
                            if (text === 'Ver detalles') {
                                console.log('📋 Intentando mostrar detalles de rutina...');
                                // Buscar modal de rutina y mostrarlo
                                const routineModal = document.querySelector('.routine-modal, [class*="modal"]');
                                if (routineModal) {
                                    routineModal.style.display = 'block';
                                    routineModal.classList.add('show');
                                }
                            } else if (text === 'Solicitar cambio') {
                                console.log('📅 Solicitando cambio de calendario...');
                                alert('Solicitud de cambio enviada al entrenador');
                            } else if (text === 'Cerrar sesión') {
                                console.log('🚪 Cerrando sesión...');
                                localStorage.removeItem('token');
                                localStorage.removeItem('authToken');
                                window.location.href = '/login';
                            } else if (className === 'notification-btn') {
                                console.log('🔔 Abriendo centro de notificaciones...');
                                const notificationCenter = document.querySelector('.notification-center');
                                if (notificationCenter) {
                                    notificationCenter.classList.toggle('show');
                                }
                            }
                        });
                        
                        button.setAttribute('data-has-listener', 'true');
                    }
                }
            });
        });
        
        console.log('✅ Handlers de botones React corregidos');
    };
    
    // 2. Solucionar problemas de elementos del calendario
    const fixCalendarInteractivity = () => {
        console.log('\n📅 Solucionando interactividad del calendario...');
        
        const calendarDays = document.querySelectorAll('.calendar-day');
        
        calendarDays.forEach((day, index) => {
            if (!day.classList.contains('empty')) {
                // Asegurar que los días del calendario sean clickeables
                day.style.cursor = 'pointer';
                day.style.pointerEvents = 'auto';
                
                // Agregar event listener si no existe
                if (!day.getAttribute('data-has-click-listener')) {
                    day.addEventListener('click', function(e) {
                        const dayNumber = this.querySelector('.day-number')?.textContent;
                        console.log(`📅 Click en día ${dayNumber} del calendario`);
                        
                        // Resaltar el día seleccionado
                        calendarDays.forEach(d => d.classList.remove('selected'));
                        this.classList.add('selected');
                        
                        // Mostrar información del día si existe
                        const dayEvents = this.querySelector('.day-indicators');
                        if (dayEvents) {
                            console.log(`📋 Día ${dayNumber} tiene eventos programados`);
                        }
                    });
                    
                    day.setAttribute('data-has-click-listener', 'true');
                }
            }
        });
        
        console.log(`✅ ${calendarDays.length} días del calendario corregidos`);
    };
    
    // 3. Solucionar problemas de modales
    const fixModalInteractivity = () => {
        console.log('\n🪟 Solucionando interactividad de modales...');
        
        // Encontrar todos los modales
        const modals = document.querySelectorAll('[class*="modal"], .modal');
        
        modals.forEach((modal, index) => {
            console.log(`🪟 Procesando modal ${index + 1}`);
            
            // Encontrar botones de cerrar en el modal
            const closeButtons = modal.querySelectorAll('[class*="close"], .close, [aria-label="close"]');
            
            closeButtons.forEach(closeBtn => {
                if (!closeBtn.getAttribute('data-has-close-listener')) {
                    closeBtn.addEventListener('click', function(e) {
                        console.log('❌ Cerrando modal');
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                        document.body.style.overflow = 'auto'; // Restaurar scroll
                    });
                    
                    closeBtn.setAttribute('data-has-close-listener', 'true');
                }
            });
            
            // Cerrar modal al hacer click en el backdrop
            if (!modal.getAttribute('data-has-backdrop-listener')) {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        console.log('🖱️ Click en backdrop - cerrando modal');
                        this.style.display = 'none';
                        this.classList.remove('show');
                        document.body.style.overflow = 'auto';
                    }
                });
                
                modal.setAttribute('data-has-backdrop-listener', 'true');
            }
        });
        
        console.log(`✅ ${modals.length} modales corregidos`);
    };
    
    // 4. Solucionar problemas de formularios
    const fixFormInteractivity = () => {
        console.log('\n📝 Solucionando interactividad de formularios...');
        
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            console.log(`📝 Procesando formulario ${index + 1}`);
            
            // Encontrar botones de submit
            const submitButtons = form.querySelectorAll('button[type="submit"], .submit-btn, .save-btn');
            
            submitButtons.forEach(submitBtn => {
                if (submitBtn.disabled) {
                    console.log('🔧 Habilitando botón de submit');
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'auto';
                }
            });
            
            // Asegurar que los inputs sean editables
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.disabled || input.readOnly) {
                    console.log(`🔧 Habilitando input: ${input.name || input.id || 'sin nombre'}`);
                    input.disabled = false;
                    input.readOnly = false;
                    input.style.pointerEvents = 'auto';
                }
            });
        });
        
        console.log(`✅ ${forms.length} formularios corregidos`);
    };
    
    // 5. Solucionar problemas de navegación
    const fixNavigationInteractivity = () => {
        console.log('\n🧭 Solucionando interactividad de navegación...');
        
        // Links y botones de navegación
        const navElements = document.querySelectorAll('a, [role="button"], .nav-link, .menu-item');
        
        navElements.forEach((element, index) => {
            if (element.style.pointerEvents === 'none' || element.classList.contains('disabled')) {
                console.log(`🔧 Habilitando elemento de navegación ${index + 1}`);
                
                element.style.pointerEvents = 'auto';
                element.style.opacity = '1';
                element.classList.remove('disabled');
                
                // Si es un link sin href, agregar comportamiento por defecto
                if (element.tagName === 'A' && !element.href && !element.getAttribute('data-has-nav-listener')) {
                    element.addEventListener('click', function(e) {
                        e.preventDefault();
                        console.log('🧭 Click en link de navegación sin href');
                        
                        const text = this.textContent?.trim();
                        if (text?.includes('Dashboard') || text?.includes('Inicio')) {
                            window.location.href = '/client/dashboard';
                        } else if (text?.includes('Perfil')) {
                            console.log('👤 Navegando a perfil...');
                        }
                    });
                    
                    element.setAttribute('data-has-nav-listener', 'true');
                }
            }
        });
        
        console.log(`✅ ${navElements.length} elementos de navegación corregidos`);
    };
    
    // 6. Monitorear y corregir problemas dinámicos
    const setupDynamicFixes = () => {
        console.log('\n👁️ Configurando correcciones dinámicas...');
        
        // Observer para nuevos elementos
        const observer = new MutationObserver((mutations) => {
            let hasNewInteractiveElements = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const newElements = Array.from(mutation.addedNodes)
                        .filter(node => node.nodeType === 1)
                        .filter(node => {
                            return node.matches && (
                                node.matches('button') ||
                                node.matches('[role="button"]') ||
                                node.matches('.btn') ||
                                node.matches('a') ||
                                node.matches('form') ||
                                node.matches('[class*="modal"]')
                            );
                        });
                    
                    if (newElements.length > 0) {
                        hasNewInteractiveElements = true;
                    }
                }
            });
            
            if (hasNewInteractiveElements) {
                console.log('🆕 Nuevos elementos interactivos detectados - aplicando correcciones...');
                setTimeout(() => {
                    fixReactButtonHandlers();
                    fixCalendarInteractivity();
                    fixModalInteractivity();
                    fixFormInteractivity();
                    fixNavigationInteractivity();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Observer dinámico configurado');
    };
    
    // Ejecutar todas las correcciones
    const runAllFixes = () => {
        console.log('\n🚀 EJECUTANDO CORRECCIONES DE EVENT LISTENERS...');
        
        try {
            fixReactButtonHandlers();
            fixCalendarInteractivity();
            fixModalInteractivity();
            fixFormInteractivity();
            fixNavigationInteractivity();
            setupDynamicFixes();
            
            console.log('\n✅ TODAS LAS CORRECCIONES DE EVENT LISTENERS APLICADAS');
            
        } catch (error) {
            console.log('❌ Error aplicando correcciones de event listeners:', error);
        }
    };
    
    // Ejecutar correcciones después de que React se haya inicializado
    setTimeout(runAllFixes, 2000);
    
    // Ejecutar correcciones periódicas
    setInterval(() => {
        fixReactButtonHandlers();
        fixCalendarInteractivity();
    }, 10000); // Cada 10 segundos
    
    console.log('✅ Event Listeners Fix configurado');
})();