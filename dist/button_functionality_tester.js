// Script para probar específicamente la funcionalidad de los botones del dashboard
(function() {
    console.log('🔘 Button Functionality Tester iniciado');
    
    // Función para simular un clic en un elemento
    const simulateClick = (element, description) => {
        if (!element) {
            console.log(`❌ ${description}: Elemento no encontrado`);
            return false;
        }
        
        console.log(`🔘 Probando ${description}...`);
        
        // Verificar si el elemento está visible y habilitado
        const rect = element.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isEnabled = !element.disabled && !element.hasAttribute('disabled');
        const hasPointerEvents = window.getComputedStyle(element).pointerEvents !== 'none';
        
        console.log(`  - Visible: ${isVisible}`);
        console.log(`  - Habilitado: ${isEnabled}`);
        console.log(`  - Pointer Events: ${hasPointerEvents}`);
        console.log(`  - Classes: ${element.className}`);
        
        if (!isVisible || !isEnabled || !hasPointerEvents) {
            console.log(`⚠️ ${description}: Elemento no interactivo`);
            return false;
        }
        
        try {
            // Simular eventos de mouse
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            
            console.log(`✅ ${description}: Clic simulado exitosamente`);
            return true;
        } catch (error) {
            console.log(`❌ ${description}: Error al simular clic:`, error);
            return false;
        }
    };
    
    // Función para encontrar botones por diferentes criterios
    const findButtons = () => {
        console.log('\n🔍 Buscando botones en el dashboard...');
        
        const buttons = {
            // Botones por texto
            logout: document.querySelector('button:contains("Cerrar sesión"), button:contains("Logout"), [data-testid="logout-button"]'),
            editProfile: document.querySelector('button:contains("Editar"), button:contains("Edit"), [data-testid="edit-profile-button"]'),
            saveProfile: document.querySelector('button:contains("Guardar"), button:contains("Save"), [data-testid="save-profile-button"]'),
            viewRoutine: document.querySelector('button:contains("Ver detalles"), button:contains("View details"), [data-testid="view-routine-button"]'),
            
            // Botones por clases comunes
            primaryButtons: document.querySelectorAll('.btn-primary, .primary-button, .button-primary'),
            secondaryButtons: document.querySelectorAll('.btn-secondary, .secondary-button, .button-secondary'),
            
            // Todos los botones
            allButtons: document.querySelectorAll('button, [role="button"], .btn, .button')
        };
        
        console.log(`📊 Botones encontrados:`);
        console.log(`  - Logout: ${buttons.logout ? '✅' : '❌'}`);
        console.log(`  - Edit Profile: ${buttons.editProfile ? '✅' : '❌'}`);
        console.log(`  - Save Profile: ${buttons.saveProfile ? '✅' : '❌'}`);
        console.log(`  - View Routine: ${buttons.viewRoutine ? '✅' : '❌'}`);
        console.log(`  - Primary buttons: ${buttons.primaryButtons.length}`);
        console.log(`  - Secondary buttons: ${buttons.secondaryButtons.length}`);
        console.log(`  - Total buttons: ${buttons.allButtons.length}`);
        
        return buttons;
    };
    
    // Función para analizar todos los botones
    const analyzeAllButtons = () => {
        console.log('\n🔍 Analizando todos los botones...');
        
        const allButtons = document.querySelectorAll('button, [role="button"], .btn, .button');
        
        allButtons.forEach((button, index) => {
            const text = button.textContent?.trim() || button.getAttribute('aria-label') || button.title || `Button ${index + 1}`;
            const rect = button.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            const isEnabled = !button.disabled && !button.hasAttribute('disabled');
            const hasPointerEvents = window.getComputedStyle(button).pointerEvents !== 'none';
            const hasClickListener = button.onclick !== null || button.addEventListener !== undefined;
            
            console.log(`\n🔘 Botón ${index + 1}: "${text}"`);
            console.log(`  - Visible: ${isVisible}`);
            console.log(`  - Habilitado: ${isEnabled}`);
            console.log(`  - Pointer Events: ${hasPointerEvents}`);
            console.log(`  - Classes: ${button.className}`);
            console.log(`  - ID: ${button.id}`);
            console.log(`  - Data attributes:`, Object.keys(button.dataset));
            
            // Verificar event listeners
            const events = getEventListeners ? getEventListeners(button) : {};
            if (Object.keys(events).length > 0) {
                console.log(`  - Event listeners:`, Object.keys(events));
            }
        });
    };
    
    // Función para probar botones específicos
    const testSpecificButtons = () => {
        console.log('\n🧪 Probando botones específicos...');
        
        const buttons = findButtons();
        
        // Probar botón de logout
        if (buttons.logout) {
            simulateClick(buttons.logout, 'Botón de Cerrar Sesión');
        }
        
        // Probar botón de editar perfil
        if (buttons.editProfile) {
            simulateClick(buttons.editProfile, 'Botón de Editar Perfil');
        }
        
        // Probar botón de ver rutina
        if (buttons.viewRoutine) {
            simulateClick(buttons.viewRoutine, 'Botón de Ver Rutina');
        }
        
        // Probar algunos botones primarios
        buttons.primaryButtons.forEach((button, index) => {
            if (index < 3) { // Solo los primeros 3
                const text = button.textContent?.trim() || `Primary Button ${index + 1}`;
                simulateClick(button, `Botón Primario: ${text}`);
            }
        });
    };
    
    // Función para monitorear cambios en el DOM
    const monitorDOMChanges = () => {
        console.log('\n👁️ Monitoreando cambios en el DOM...');
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const addedButtons = Array.from(mutation.addedNodes)
                        .filter(node => node.nodeType === 1)
                        .filter(node => node.matches && node.matches('button, [role="button"], .btn, .button'));
                    
                    if (addedButtons.length > 0) {
                        console.log(`🆕 Nuevos botones detectados: ${addedButtons.length}`);
                        addedButtons.forEach((button, index) => {
                            const text = button.textContent?.trim() || `New Button ${index + 1}`;
                            console.log(`  - ${text}`);
                        });
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Monitor de DOM configurado');
    };
    
    // Función para verificar el estado de React
    const checkReactState = () => {
        console.log('\n⚛️ Verificando estado de React...');
        
        // Buscar elementos con React Fiber
        const reactElements = document.querySelectorAll('[data-reactroot], [data-react-checksum]');
        console.log(`⚛️ Elementos React encontrados: ${reactElements.length}`);
        
        // Verificar si hay errores de React en la consola
        const originalError = console.error;
        let reactErrors = [];
        
        console.error = function(...args) {
            const message = args.join(' ');
            if (message.includes('React') || message.includes('Warning:')) {
                reactErrors.push(message);
                console.log('⚛️ Error/Warning de React detectado:', message);
            }
            originalError.apply(console, args);
        };
        
        // Verificar hooks de React
        setTimeout(() => {
            if (reactErrors.length > 0) {
                console.log(`⚠️ Total de errores/warnings de React: ${reactErrors.length}`);
            } else {
                console.log('✅ No se detectaron errores de React');
            }
        }, 2000);
    };
    
    // Ejecutar todas las pruebas
    setTimeout(() => {
        console.log('\n🚀 INICIANDO PRUEBAS DE FUNCIONALIDAD DE BOTONES...');
        
        checkReactState();
        findButtons();
        analyzeAllButtons();
        testSpecificButtons();
        monitorDOMChanges();
        
        // Ejecutar pruebas periódicas
        setInterval(() => {
            console.log('\n🔄 Ejecutando verificación periódica...');
            const buttons = findButtons();
            
            if (buttons.allButtons.length === 0) {
                console.log('⚠️ No se encontraron botones en el DOM');
            }
        }, 15000); // Cada 15 segundos
        
    }, 3000);
    
    console.log('✅ Button Functionality Tester configurado');
})();

// Extensión para querySelector con texto
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// Función helper para buscar por texto
function findElementByText(selector, text) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).find(el => el.textContent.includes(text));
}