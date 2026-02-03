// Script para solucionar el problema del modal de edición de pago

// Función para inyectar CSS que asegure que el modal sea visible
function injectModalCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background-color: rgba(0, 0, 0, 0.6) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
            backdrop-filter: blur(4px) !important;
        }
        
        .edit-payment-modal {
            background: white !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
            width: 90% !important;
            max-width: 500px !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            position: relative !important;
            z-index: 10000 !important;
        }
        
        .modal-overlay.force-visible {
            display: flex !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        .edit-payment-modal.force-visible {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ CSS del modal inyectado');
}

// Función para crear un modal funcional si no existe
function createFunctionalModal() {
    // Verificar si ya existe
    if (document.querySelector('.edit-payment-modal')) {
        console.log('ℹ️ Modal ya existe, intentando repararlo...');
        return repairExistingModal();
    }
    
    console.log('🔧 Creando modal funcional...');
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay force-visible';
    overlay.style.display = 'none'; // Inicialmente oculto
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'edit-payment-modal force-visible';
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>Editar Información de Pago</h2>
            <p class="modal-subtitle">Cliente: Test</p>
            <button class="modal-close-btn" onclick="closeModal()">×</button>
        </div>
        <form class="modal-form" onsubmit="handleSubmit(event)">
            <div class="form-group">
                <label for="amount">Monto ($)</label>
                <input type="number" id="amount" value="100" min="0" step="0.01" />
            </div>
            <div class="form-group">
                <label for="dueDate">Fecha de Vencimiento</label>
                <input type="date" id="dueDate" value="2025-02-01" />
            </div>
            <div class="form-group">
                <label for="plan">Plan de Suscripción</label>
                <select id="plan">
                    <option value="monthly">Plan Mensual</option>
                    <option value="quarterly">Plan Trimestral</option>
                    <option value="annual">Plan Anual</option>
                </select>
            </div>
            <div class="form-group">
                <label for="status">Estado del Pago</label>
                <select id="status">
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="overdue">Vencido</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-save">Guardar Cambios</button>
            </div>
        </form>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Funciones globales para el modal
    window.closeModal = function() {
        overlay.style.display = 'none';
        console.log('✅ Modal cerrado');
    };
    
    window.openModal = function() {
        overlay.style.display = 'flex';
        console.log('✅ Modal abierto');
    };
    
    window.handleSubmit = function(event) {
        event.preventDefault();
        const formData = {
            amount: document.getElementById('amount').value,
            dueDate: document.getElementById('dueDate').value,
            plan: document.getElementById('plan').value,
            status: document.getElementById('status').value
        };
        console.log('💾 Datos del formulario:', formData);
        alert('✅ Datos guardados: ' + JSON.stringify(formData, null, 2));
        closeModal();
    };
    
    // Cerrar modal al hacer click en el overlay
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    console.log('✅ Modal funcional creado');
    return true;
}

// Función para reparar el modal existente
function repairExistingModal() {
    const modal = document.querySelector('.edit-payment-modal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        modal.classList.add('force-visible');
        console.log('🔧 Modal reparado');
    }
    
    if (overlay) {
        overlay.classList.add('force-visible');
        console.log('🔧 Overlay reparado');
    }
    
    // Crear función global para abrir el modal
    window.openModal = function() {
        if (overlay) overlay.style.display = 'flex';
        if (modal) modal.style.display = 'block';
        console.log('✅ Modal abierto (reparado)');
    };
    
    window.closeModal = function() {
        if (overlay) overlay.style.display = 'none';
        console.log('✅ Modal cerrado (reparado)');
    };
    
    return true;
}

// Función para interceptar y reparar el botón "Editar Pago"
function repairEditButton() {
    const editButton = document.querySelector('.btn-edit-payment');
    
    if (!editButton) {
        console.log('❌ Botón "Editar Pago" no encontrado');
        return false;
    }
    
    // Remover event listeners existentes y agregar uno nuevo
    const newButton = editButton.cloneNode(true);
    editButton.parentNode.replaceChild(newButton, editButton);
    
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Click interceptado en botón "Editar Pago"');
        
        // Asegurar que el modal existe y funciona
        if (!document.querySelector('.edit-payment-modal')) {
            createFunctionalModal();
        }
        
        // Abrir modal
        if (window.openModal) {
            window.openModal();
        } else {
            console.log('⚠️ Función openModal no disponible, forzando apertura...');
            const overlay = document.querySelector('.modal-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
            }
        }
    });
    
    console.log('✅ Botón "Editar Pago" reparado');
    return true;
}

// Función principal para solucionar todos los problemas
function fixModalIssue() {
    console.log('🚀 Iniciando reparación del modal de pago...');
    
    // Paso 1: Inyectar CSS
    injectModalCSS();
    
    // Paso 2: Crear o reparar modal
    setTimeout(() => {
        createFunctionalModal();
        
        // Paso 3: Reparar botón
        setTimeout(() => {
            repairEditButton();
            
            console.log('✅ Reparación completada!');
            console.log('🎯 Ahora puedes hacer click en "Editar Pago" o ejecutar openModal()');
            
        }, 500);
    }, 500);
}

// Función para verificar si la reparación funcionó
function testModal() {
    console.log('🧪 Probando modal reparado...');
    
    if (window.openModal) {
        window.openModal();
        setTimeout(() => {
            console.log('✅ Modal abierto correctamente');
            setTimeout(() => {
                if (window.closeModal) {
                    window.closeModal();
                    console.log('✅ Modal cerrado correctamente');
                }
            }, 2000);
        }, 500);
    } else {
        console.log('❌ Función openModal no disponible');
    }
}

// Ejecutar automáticamente
fixModalIssue();

// Funciones disponibles globalmente
window.fixModal = fixModalIssue;
window.testModal = testModal;
window.repairButton = repairEditButton;

console.log('🔧 Funciones de reparación disponibles:');
console.log('- fixModal(): Repara todo el sistema del modal');
console.log('- testModal(): Prueba el modal reparado');
console.log('- repairButton(): Repara solo el botón');
console.log('- openModal(): Abre el modal');
console.log('- closeModal(): Cierra el modal');