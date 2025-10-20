// Test para simular la edición de perfil desde el navegador
// Ejecutar en la consola del navegador cuando esté en el dashboard del cliente

console.log('🧪 Iniciando test de edición de perfil...');

// Función para simular clic en el botón de editar perfil
function simulateEditProfile() {
    console.log('🔍 Buscando botón de editar perfil...');
    
    // Buscar el botón de editar perfil
    const editButtons = document.querySelectorAll('button');
    let editButton = null;
    
    for (let button of editButtons) {
        const text = button.textContent?.toLowerCase() || '';
        if (text.includes('editar') || text.includes('edit')) {
            editButton = button;
            console.log('✅ Botón de editar encontrado:', button.textContent);
            break;
        }
    }
    
    if (!editButton) {
        // Buscar por clases CSS comunes
        editButton = document.querySelector('.edit-btn, .edit-profile-btn, [data-testid="edit-profile"]');
    }
    
    if (editButton) {
        console.log('🖱️ Haciendo clic en el botón de editar...');
        editButton.click();
        
        // Esperar a que aparezca el modal
        setTimeout(() => {
            fillAndSubmitForm();
        }, 1000);
    } else {
        console.error('❌ No se encontró el botón de editar perfil');
        console.log('📋 Botones disponibles:');
        editButtons.forEach((btn, index) => {
            console.log(`  ${index + 1}. "${btn.textContent?.trim()}"`);
        });
    }
}

// Función para llenar y enviar el formulario
function fillAndSubmitForm() {
    console.log('📝 Llenando formulario del modal...');
    
    // Buscar campos del formulario
    const weightInput = document.querySelector('input[name="weight"], input[id="weight"]');
    const frequencySelect = document.querySelector('select[name="trainingFrequency"], select[id="trainingFrequency"]');
    const objectiveTextarea = document.querySelector('textarea[name="objective"], textarea[id="objective"]');
    
    console.log('📋 Campos encontrados:');
    console.log('- Peso:', weightInput ? '✅' : '❌');
    console.log('- Frecuencia:', frequencySelect ? '✅' : '❌');
    console.log('- Objetivo:', objectiveTextarea ? '✅' : '❌');
    
    // Llenar los campos
    if (weightInput) {
        console.log('🔄 Actualizando peso a 75.5kg...');
        weightInput.value = '75.5';
        weightInput.dispatchEvent(new Event('input', { bubbles: true }));
        weightInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (frequencySelect) {
        console.log('🔄 Actualizando frecuencia a 4 días...');
        frequencySelect.value = '4';
        frequencySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (objectiveTextarea) {
        console.log('🔄 Actualizando objetivo...');
        objectiveTextarea.value = 'Ganar masa muscular y mejorar fuerza';
        objectiveTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        objectiveTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Esperar un momento y luego buscar el botón de guardar
    setTimeout(() => {
        submitForm();
    }, 500);
}

// Función para enviar el formulario
function submitForm() {
    console.log('💾 Buscando botón de guardar...');
    
    // Buscar el botón de guardar
    const saveButtons = document.querySelectorAll('button[type="submit"], .save-btn, .btn-primary');
    let saveButton = null;
    
    for (let button of saveButtons) {
        const text = button.textContent?.toLowerCase() || '';
        if (text.includes('guardar') || text.includes('save') || text.includes('actualizar')) {
            saveButton = button;
            console.log('✅ Botón de guardar encontrado:', button.textContent);
            break;
        }
    }
    
    if (saveButton) {
        console.log('🖱️ Haciendo clic en guardar...');
        saveButton.click();
        
        // Monitorear la respuesta
        setTimeout(() => {
            console.log('⏱️ Esperando respuesta del servidor...');
            checkForUpdates();
        }, 2000);
    } else {
        console.error('❌ No se encontró el botón de guardar');
        console.log('📋 Botones disponibles en el modal:');
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach((btn, index) => {
            console.log(`  ${index + 1}. "${btn.textContent?.trim()}"`);
        });
    }
}

// Función para verificar si los datos se actualizaron
function checkForUpdates() {
    console.log('🔍 Verificando si los datos se actualizaron...');
    
    // Buscar elementos que muestren las métricas actuales
    const metricsElements = document.querySelectorAll('.metric-value, .progress-metric, [class*="metric"], [class*="progress"]');
    
    console.log('📊 Métricas actuales en el DOM:');
    metricsElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 0) {
            console.log(`  ${index + 1}. ${text}`);
        }
    });
    
    // También verificar si hay mensajes de éxito/error
    const toastMessages = document.querySelectorAll('.toast, .notification, .alert, [class*="toast"], [class*="notification"]');
    if (toastMessages.length > 0) {
        console.log('📢 Mensajes de notificación:');
        toastMessages.forEach((msg, index) => {
            console.log(`  ${index + 1}. ${msg.textContent?.trim()}`);
        });
    }
}

// Función para monitorear solicitudes de red
function setupNetworkMonitoring() {
    console.log('🌐 Configurando monitoreo de red...');
    
    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        if (typeof url === 'string' && url.includes('/profile') && options.method === 'PUT') {
            console.log('🚀 [NETWORK] Solicitud PUT detectada:');
            console.log('  URL:', url);
            console.log('  Método:', options.method);
            console.log('  Headers:', options.headers);
            console.log('  Body:', options.body);
        }
        
        return originalFetch.apply(this, args).then(response => {
            if (typeof url === 'string' && url.includes('/profile') && options.method === 'PUT') {
                console.log('📥 [NETWORK] Respuesta recibida:');
                console.log('  Status:', response.status);
                console.log('  StatusText:', response.statusText);
            }
            return response;
        }).catch(error => {
            if (typeof url === 'string' && url.includes('/profile') && options.method === 'PUT') {
                console.error('❌ [NETWORK] Error en solicitud:', error);
            }
            throw error;
        });
    };
}

// Configurar monitoreo y ejecutar test
setupNetworkMonitoring();

console.log('🚀 Iniciando simulación en 2 segundos...');
setTimeout(() => {
    simulateEditProfile();
}, 2000);

console.log('📝 Script cargado. También puedes ejecutar simulateEditProfile() manualmente.');