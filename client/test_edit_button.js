// Script de depuración para el botón "Editar cliente"
console.log('🔍 Iniciando depuración del botón "Editar cliente"...');

// 1. Verificar si estamos en la página correcta
const currentPath = window.location.pathname;
console.log('📍 Ruta actual:', currentPath);

// 2. Verificar tab activo
const tabs = document.querySelectorAll('[style*="background"]');
const activeTab = Array.from(tabs).find(tab => 
    tab.style.background.includes('#dc2626') || 
    tab.style.backgroundColor.includes('#dc2626')
);
console.log('📋 Tab activo:', activeTab?.textContent?.trim());

// 3. Buscar sección "Información de Salud"
const healthHeaders = Array.from(document.querySelectorAll('h2')).filter(h2 => 
    h2.textContent.includes('Información de Salud')
);
console.log('🏥 Secciones de salud encontradas:', healthHeaders.length);

healthHeaders.forEach((header, index) => {
    console.log(`🏥 Sección ${index + 1}:`, header.textContent);
    
    // Buscar el contenedor padre
    const parentDiv = header.closest('div');
    if (parentDiv) {
        console.log(`📦 Contenedor padre encontrado para sección ${index + 1}`);
        
        // Buscar botones en este contenedor
        const buttons = parentDiv.querySelectorAll('button');
        console.log(`🔘 Botones encontrados en sección ${index + 1}:`, buttons.length);
        
        buttons.forEach((btn, btnIndex) => {
            console.log(`  🔘 Botón ${btnIndex + 1}:`, btn.textContent?.trim());
            console.log(`  📝 Clases:`, btn.className);
            console.log(`  👁️ Visible:`, btn.offsetWidth > 0 && btn.offsetHeight > 0);
            console.log(`  🎨 Estilos:`, window.getComputedStyle(btn).display);
        });
        
        // Buscar específicamente el botón de editar
        const editButton = parentDiv.querySelector('.btn-edit-client');
        if (editButton) {
            console.log('✅ Botón "Editar cliente" encontrado!');
            console.log('📝 Texto:', editButton.textContent);
            console.log('👁️ Visible:', editButton.offsetWidth > 0 && editButton.offsetHeight > 0);
            console.log('🎨 Display:', window.getComputedStyle(editButton).display);
            console.log('🎨 Visibility:', window.getComputedStyle(editButton).visibility);
            console.log('🎨 Opacity:', window.getComputedStyle(editButton).opacity);
        } else {
            console.log('❌ Botón "Editar cliente" NO encontrado en esta sección');
        }
        
        // Buscar div con clase action-buttons
        const actionButtons = parentDiv.querySelector('.action-buttons');
        if (actionButtons) {
            console.log('📦 Contenedor action-buttons encontrado');
            console.log('👁️ Visible:', actionButtons.offsetWidth > 0 && actionButtons.offsetHeight > 0);
            console.log('🎨 Display:', window.getComputedStyle(actionButtons).display);
            console.log('🔘 Botones hijos:', actionButtons.children.length);
        } else {
            console.log('❌ Contenedor action-buttons NO encontrado');
        }
    }
});

// 4. Buscar todos los botones con clase btn-edit-client en toda la página
const allEditButtons = document.querySelectorAll('.btn-edit-client');
console.log('🔍 Total de botones .btn-edit-client en la página:', allEditButtons.length);

allEditButtons.forEach((btn, index) => {
    console.log(`🔘 Botón edit ${index + 1}:`);
    console.log('  📝 Texto:', btn.textContent?.trim());
    console.log('  👁️ Visible:', btn.offsetWidth > 0 && btn.offsetHeight > 0);
    console.log('  🎨 Display:', window.getComputedStyle(btn).display);
    console.log('  📍 Posición:', btn.getBoundingClientRect());
});

// 5. Verificar si hay errores de JavaScript
console.log('🐛 Verificando errores...');
window.addEventListener('error', (e) => {
    console.error('❌ Error JavaScript:', e.error);
});

// 6. Intentar forzar la visibilidad del botón si existe
setTimeout(() => {
    const editBtn = document.querySelector('.btn-edit-client');
    if (editBtn) {
        console.log('🔧 Intentando hacer visible el botón...');
        editBtn.style.display = 'flex !important';
        editBtn.style.visibility = 'visible !important';
        editBtn.style.opacity = '1 !important';
        console.log('✅ Estilos aplicados al botón');
    }
}, 1000);

console.log('🏁 Depuración completada. Revisa los resultados arriba.');