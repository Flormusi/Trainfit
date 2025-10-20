// Script de diagnóstico avanzado para el problema de actualización del peso
// Ejecutar en la consola del navegador después de hacer login

console.log('🔍 Iniciando diagnóstico avanzado del peso...');

// 1. Función para verificar el estado actual del componente
function checkCurrentState() {
  console.log('\n=== ESTADO ACTUAL DEL COMPONENTE ===');
  
  // Buscar elementos de peso en el DOM
  const weightElements = document.querySelectorAll('[class*="weight"], [class*="peso"], [class*="metric"]');
  console.log('📊 Elementos relacionados con peso encontrados:', weightElements.length);
  
  weightElements.forEach((el, index) => {
    console.log(`Elemento ${index + 1}:`, {
      tagName: el.tagName,
      className: el.className,
      textContent: el.textContent.trim(),
      innerHTML: el.innerHTML
    });
  });
  
  // Buscar específicamente el valor del peso actual
  const weightValue = document.querySelector('.metric-value');
  if (weightValue) {
    console.log('⚖️ Valor de peso encontrado:', weightValue.textContent);
  }
  
  // Verificar métricas de progreso
  const progressMetrics = document.querySelector('.progress-metrics');
  if (progressMetrics) {
    console.log('📈 Sección de métricas encontrada:', progressMetrics.innerHTML);
  }
}

// 2. Función para interceptar todas las llamadas de red
function interceptNetworkCalls() {
  console.log('\n=== INTERCEPTANDO LLAMADAS DE RED ===');
  
  // Interceptar fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('🌐 Fetch interceptado:', args[0]);
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('📥 Respuesta recibida:', {
          url: args[0],
          status: response.status,
          statusText: response.statusText
        });
        
        // Clonar la respuesta para poder leerla
        const clonedResponse = response.clone();
        if (args[0].includes('profile') || args[0].includes('client')) {
          clonedResponse.json().then(data => {
            console.log('📋 Datos de perfil/cliente:', data);
            if (data.weight) {
              console.log('⚖️ Peso en respuesta:', data.weight);
            }
          }).catch(() => {});
        }
        
        return response;
      })
      .catch(error => {
        console.error('❌ Error en fetch:', error);
        throw error;
      });
  };
  
  console.log('✅ Interceptor de fetch instalado');
}

// 3. Función para monitorear cambios en el DOM
function monitorDOMChanges() {
  console.log('\n=== MONITOREANDO CAMBIOS EN EL DOM ===');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node;
            if (element.textContent && element.textContent.includes('kg')) {
              console.log('⚖️ Nuevo elemento con peso detectado:', {
                element: element,
                textContent: element.textContent,
                className: element.className
              });
            }
          }
        });
      }
      
      if (mutation.type === 'characterData' || mutation.type === 'attributes') {
        const target = mutation.target;
        if (target.textContent && target.textContent.includes('kg')) {
          console.log('🔄 Cambio en elemento con peso:', {
            target: target,
            textContent: target.textContent,
            type: mutation.type
          });
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });
  
  console.log('✅ Observer de DOM instalado');
  return observer;
}

// 4. Función para verificar el estado de React
function checkReactState() {
  console.log('\n=== VERIFICANDO ESTADO DE REACT ===');
  
  // Buscar el elemento raíz de React
  const reactRoot = document.querySelector('[data-reactroot], #root');
  if (reactRoot) {
    console.log('⚛️ Elemento raíz de React encontrado');
    
    // Intentar acceder a las props de React (solo funciona en desarrollo)
    const reactFiber = reactRoot._reactInternalFiber || reactRoot._reactInternalInstance;
    if (reactFiber) {
      console.log('🔍 Fiber de React encontrado:', reactFiber);
    }
  }
  
  // Verificar si hay errores de React en la consola
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0] && args[0].includes && args[0].includes('React')) {
      console.log('⚠️ Error de React detectado:', args);
    }
    originalError.apply(console, args);
  };
}

// 5. Función para simular actualización de perfil
function simulateProfileUpdate() {
  console.log('\n=== SIMULANDO ACTUALIZACIÓN DE PERFIL ===');
  
  // Buscar el botón de editar perfil
  const editButton = document.querySelector('[class*="edit"], button[onclick*="profile"], button[onclick*="perfil"]');
  if (editButton) {
    console.log('✏️ Botón de editar encontrado:', editButton);
    console.log('Texto del botón:', editButton.textContent);
  }
  
  // Buscar modales de edición
  const modals = document.querySelectorAll('[class*="modal"], [class*="Modal"]');
  console.log('🪟 Modales encontrados:', modals.length);
  
  modals.forEach((modal, index) => {
    console.log(`Modal ${index + 1}:`, {
      className: modal.className,
      display: window.getComputedStyle(modal).display,
      visibility: window.getComputedStyle(modal).visibility
    });
  });
}

// 6. Función principal de diagnóstico
function runAdvancedDiagnosis() {
  console.log('🚀 Ejecutando diagnóstico avanzado...');
  
  checkCurrentState();
  interceptNetworkCalls();
  const observer = monitorDOMChanges();
  checkReactState();
  simulateProfileUpdate();
  
  console.log('\n✅ Diagnóstico completo. Ahora intenta editar el perfil y observa los logs.');
  
  // Función para detener el monitoreo
  window.stopDiagnosis = function() {
    observer.disconnect();
    console.log('🛑 Diagnóstico detenido');
  };
  
  return {
    checkCurrentState,
    observer,
    stopDiagnosis: window.stopDiagnosis
  };
}

// 7. Función para forzar actualización manual
function forceManualUpdate() {
  console.log('\n=== FORZANDO ACTUALIZACIÓN MANUAL ===');
  
  // Intentar disparar eventos de React
  const reactEvents = ['input', 'change', 'click', 'focus', 'blur'];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (element.textContent && element.textContent.includes('kg')) {
      reactEvents.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        element.dispatchEvent(event);
      });
    }
  });
  
  // Forzar re-render disparando resize
  window.dispatchEvent(new Event('resize'));
  
  console.log('🔄 Eventos de actualización disparados');
}

// Exportar funciones globalmente
window.advancedWeightDebug = {
  runAdvancedDiagnosis,
  checkCurrentState,
  forceManualUpdate,
  interceptNetworkCalls,
  monitorDOMChanges,
  simulateProfileUpdate
};

console.log('\n🎯 Script cargado. Usa las siguientes funciones:');
console.log('- advancedWeightDebug.runAdvancedDiagnosis() - Ejecutar diagnóstico completo');
console.log('- advancedWeightDebug.checkCurrentState() - Verificar estado actual');
console.log('- advancedWeightDebug.forceManualUpdate() - Forzar actualización manual');
console.log('- stopDiagnosis() - Detener monitoreo (después de ejecutar diagnóstico)');

// Auto-ejecutar diagnóstico
runAdvancedDiagnosis();