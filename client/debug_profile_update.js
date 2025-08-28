// Script de depuración mejorado para probar la actualización del perfil
// Ejecutar en la consola del navegador cuando esté en el dashboard del cliente

console.log('🔧 Script de depuración mejorado iniciado');

// Función para verificar el estado actual de las métricas
function checkCurrentMetrics() {
  console.log('📊 Verificando métricas actuales...');
  
  // Buscar elementos de métricas
  const weightElement = document.querySelector('.metric-value');
  const frequencyElements = document.querySelectorAll('.metric-value');
  const objectiveElements = document.querySelectorAll('.metric-value');
  
  console.log('🔍 Elementos de métricas encontrados:');
  frequencyElements.forEach((element, index) => {
    console.log(`Métrica ${index + 1}:`, element.textContent);
  });
  
  // Verificar si hay datos de React en los elementos
  const reactRoot = document.querySelector('#root');
  if (reactRoot && reactRoot._reactInternalFiber) {
    console.log('⚛️ React detectado, intentando acceder al estado...');
  }
}

// Función para simular actualización de perfil paso a paso
function testProfileUpdateStepByStep() {
  console.log('🧪 Iniciando prueba paso a paso de actualización de perfil');
  
  // Paso 1: Verificar métricas actuales
  checkCurrentMetrics();
  
  // Paso 2: Buscar y hacer clic en el botón de editar perfil
  const editButton = document.querySelector('.edit-profile-btn, button[title="Editar perfil"]');
  
  if (editButton) {
    console.log('✅ Botón de editar perfil encontrado:', editButton);
    console.log('🖱️ Haciendo clic en el botón de editar perfil...');
    editButton.click();
    
    // Esperar a que aparezca el modal
    setTimeout(() => {
      console.log('⏰ Buscando modal después de 500ms...');
      
      const modal = document.querySelector('.modal, [class*="Modal"], [role="dialog"]');
      if (modal) {
        console.log('✅ Modal encontrado:', modal);
        
        // Buscar campos del formulario
        const weightInput = modal.querySelector('input[name="weight"], input[placeholder*="peso"], input[placeholder*="Peso"]');
        const frequencySelect = modal.querySelector('select[name="trainingFrequency"], select[name="frequency"]');
        const objectiveSelect = modal.querySelector('select[name="objective"], select[name="objetivo"]');
        
        console.log('📋 Campos del formulario:');
        console.log('- Peso:', weightInput ? 'Encontrado' : 'No encontrado');
        console.log('- Frecuencia:', frequencySelect ? 'Encontrado' : 'No encontrado');
        console.log('- Objetivo:', objectiveSelect ? 'Encontrado' : 'No encontrado');
        
        if (weightInput) {
          console.log('📝 Valor actual del peso:', weightInput.value);
          weightInput.value = '77';
          weightInput.dispatchEvent(new Event('input', { bubbles: true }));
          weightInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✏️ Peso actualizado a 77kg');
        }
        
        if (frequencySelect) {
          console.log('📝 Valor actual de frecuencia:', frequencySelect.value);
          frequencySelect.value = '4';
          frequencySelect.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✏️ Frecuencia actualizada a 4 días/semana');
        }
        
        if (objectiveSelect) {
          console.log('📝 Valor actual del objetivo:', objectiveSelect.value);
          objectiveSelect.value = 'Perder peso';
          objectiveSelect.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✏️ Objetivo actualizado a Perder peso');
        }
        
        // Buscar y hacer clic en el botón de guardar
        setTimeout(() => {
          const saveButton = modal.querySelector('button[type="submit"], button:contains("Guardar"), button:contains("Actualizar")');
          const allButtons = modal.querySelectorAll('button');
          
          console.log('🔍 Botones encontrados en el modal:', allButtons.length);
          allButtons.forEach((btn, index) => {
            console.log(`Botón ${index + 1}:`, btn.textContent, btn.type);
          });
          
          if (saveButton) {
            console.log('✅ Botón de guardar encontrado:', saveButton);
            console.log('💾 Haciendo clic en guardar...');
            saveButton.click();
            
            // Monitorear cambios después de guardar
            setTimeout(() => {
              console.log('🔄 Verificando métricas después de guardar...');
              checkCurrentMetrics();
            }, 2000);
            
          } else {
            console.log('❌ No se encontró el botón de guardar');
            // Intentar con el primer botón que no sea de cancelar
            const possibleSaveButton = Array.from(allButtons).find(btn => 
              !btn.textContent.toLowerCase().includes('cancelar') && 
              !btn.textContent.toLowerCase().includes('cerrar')
            );
            
            if (possibleSaveButton) {
              console.log('🎯 Intentando con botón alternativo:', possibleSaveButton.textContent);
              possibleSaveButton.click();
            }
          }
        }, 1000);
        
      } else {
        console.log('❌ No se encontró el modal de edición');
        console.log('🔍 Elementos con clase modal:', document.querySelectorAll('[class*="modal"], [class*="Modal"]'));
      }
    }, 500);
    
  } else {
    console.log('❌ No se encontró el botón de editar perfil');
    console.log('🔍 Botones disponibles:');
    document.querySelectorAll('button').forEach((btn, index) => {
      console.log(`Botón ${index + 1}:`, btn.textContent, btn.className);
    });
  }
}

// Función para monitorear cambios en tiempo real
function startMetricsMonitoring() {
  console.log('👀 Iniciando monitoreo de métricas en tiempo real...');
  
  const metricsContainer = document.querySelector('.progress-metrics, .metrics-list');
  if (metricsContainer) {
    console.log('✅ Contenedor de métricas encontrado');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          console.log('🔄 Cambio detectado en las métricas:', {
            type: mutation.type,
            target: mutation.target,
            addedNodes: mutation.addedNodes.length,
            removedNodes: mutation.removedNodes.length
          });
          
          // Verificar métricas actuales
          setTimeout(() => checkCurrentMetrics(), 100);
        }
      });
    });
    
    observer.observe(metricsContainer, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
    
    console.log('👀 Observer configurado correctamente');
    return observer;
  } else {
    console.log('❌ No se encontró el contenedor de métricas');
    return null;
  }
}

// Inicializar monitoreo
const observer = startMetricsMonitoring();

// Verificar estado inicial
checkCurrentMetrics();

console.log('🔧 Script listo. Comandos disponibles:');
console.log('- testProfileUpdateStepByStep(): Prueba completa paso a paso');
console.log('- checkCurrentMetrics(): Verificar métricas actuales');
console.log('- startMetricsMonitoring(): Reiniciar monitoreo');

// Auto-ejecutar la prueba después de 2 segundos
setTimeout(() => {
  console.log('🚀 Ejecutando prueba automática...');
  testProfileUpdateStepByStep();
}, 2000);