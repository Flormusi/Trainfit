// Script de depuración para monitorear las solicitudes de red al actualizar el perfil

// Función para interceptar solicitudes de red
function interceptNetworkRequests() {
  const originalFetch = window.fetch;
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  // Interceptar fetch
  window.fetch = async function(...args) {
    const [url, options] = args;
    console.log('🌐 FETCH REQUEST:', {
      url,
      method: options?.method || 'GET',
      headers: options?.headers,
      body: options?.body
    });
    
    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();
      const responseData = await clonedResponse.text();
      
      console.log('📥 FETCH RESPONSE:', {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      });
      
      return response;
    } catch (error) {
      console.error('❌ FETCH ERROR:', { url, error });
      throw error;
    }
  };

  // Interceptar XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._method = method;
    this._url = url;
    console.log('🌐 XHR REQUEST:', { method, url });
    return originalXHROpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(data) {
    console.log('📤 XHR SEND:', {
      method: this._method,
      url: this._url,
      data: data
    });
    
    this.addEventListener('load', () => {
      console.log('📥 XHR RESPONSE:', {
        method: this._method,
        url: this._url,
        status: this.status,
        statusText: this.statusText,
        response: this.responseText
      });
    });
    
    this.addEventListener('error', () => {
      console.error('❌ XHR ERROR:', {
        method: this._method,
        url: this._url,
        status: this.status,
        statusText: this.statusText
      });
    });
    
    return originalXHRSend.apply(this, [data]);
  };
}

// Función para verificar el estado actual del dashboard
function checkCurrentDashboardState() {
  console.log('\n=== ESTADO ACTUAL DEL DASHBOARD ===');
  
  // Verificar métricas de progreso
  const progressSection = document.querySelector('[class*="progress"], [class*="metric"]');
  if (progressSection) {
    console.log('📊 Sección de progreso encontrada:', progressSection.textContent);
  }
  
  // Buscar elementos que contengan peso, frecuencia u objetivo
  const weightElements = document.querySelectorAll('*');
  const relevantElements = [];
  
  weightElements.forEach(el => {
    const text = el.textContent?.toLowerCase() || '';
    if ((text.includes('kg') || text.includes('peso') || text.includes('días') || text.includes('objetivo')) && 
        el.children.length === 0) {
      relevantElements.push({
        element: el,
        text: el.textContent,
        className: el.className
      });
    }
  });
  
  console.log('🎯 Elementos relevantes encontrados:', relevantElements);
  
  // Verificar si hay un modal de edición
  const editButton = document.querySelector('button[class*="edit"], button:contains("Editar")');
  console.log('✏️ Botón de editar encontrado:', editButton);
  
  return { progressSection, relevantElements, editButton };
}

// Función para simular la actualización del perfil
async function simulateProfileUpdate() {
  console.log('\n=== INICIANDO SIMULACIÓN DE ACTUALIZACIÓN ===');
  
  const { editButton } = checkCurrentDashboardState();
  
  if (!editButton) {
    console.error('❌ No se encontró el botón de editar');
    return;
  }
  
  // Hacer clic en el botón de editar
  console.log('🖱️ Haciendo clic en el botón de editar...');
  editButton.click();
  
  // Esperar a que aparezca el modal
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Buscar el modal
  const modal = document.querySelector('[class*="modal"], [role="dialog"]');
  if (!modal) {
    console.error('❌ No se encontró el modal de edición');
    return;
  }
  
  console.log('✅ Modal de edición encontrado');
  
  // Buscar campos de entrada
  const weightInput = modal.querySelector('input[name*="weight"], input[placeholder*="peso"], input[placeholder*="Peso"]');
  const frequencyInput = modal.querySelector('input[name*="frequency"], input[name*="training"], input[placeholder*="días"], input[placeholder*="frecuencia"]');
  const objectiveInput = modal.querySelector('input[name*="objective"], input[name*="goal"], textarea[name*="objective"], textarea[name*="goal"]');
  
  console.log('📝 Campos encontrados:', {
    weight: weightInput,
    frequency: frequencyInput,
    objective: objectiveInput
  });
  
  // Rellenar campos con valores de prueba
  const testData = {
    weight: '75.5',
    frequency: '4',
    objective: 'Ganar masa muscular y mejorar resistencia'
  };
  
  if (weightInput) {
    weightInput.value = testData.weight;
    weightInput.dispatchEvent(new Event('input', { bubbles: true }));
    weightInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Peso actualizado a:', testData.weight);
  }
  
  if (frequencyInput) {
    frequencyInput.value = testData.frequency;
    frequencyInput.dispatchEvent(new Event('input', { bubbles: true }));
    frequencyInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Frecuencia actualizada a:', testData.frequency);
  }
  
  if (objectiveInput) {
    objectiveInput.value = testData.objective;
    objectiveInput.dispatchEvent(new Event('input', { bubbles: true }));
    objectiveInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Objetivo actualizado a:', testData.objective);
  }
  
  // Buscar y hacer clic en el botón de guardar
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const saveButton = modal.querySelector('button[type="submit"], button:contains("Guardar"), button:contains("Actualizar")');
  if (!saveButton) {
    // Buscar por texto del botón
    const buttons = modal.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(btn => 
      btn.textContent?.toLowerCase().includes('guardar') || 
      btn.textContent?.toLowerCase().includes('actualizar') ||
      btn.textContent?.toLowerCase().includes('save')
    );
    
    if (saveBtn) {
      console.log('💾 Haciendo clic en guardar...');
      saveBtn.click();
    } else {
      console.error('❌ No se encontró el botón de guardar');
      return;
    }
  } else {
    console.log('💾 Haciendo clic en guardar...');
    saveButton.click();
  }
  
  // Esperar a que se procese la actualización
  console.log('⏳ Esperando respuesta del servidor...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Verificar el estado después de la actualización
  console.log('\n=== VERIFICANDO ESTADO DESPUÉS DE LA ACTUALIZACIÓN ===');
  checkCurrentDashboardState();
}

// Función para monitorear cambios en el DOM
function monitorDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const target = mutation.target;
        if (target.textContent && 
            (target.textContent.includes('kg') || 
             target.textContent.includes('días') || 
             target.textContent.includes('objetivo'))) {
          console.log('🔄 Cambio detectado en el DOM:', {
            type: mutation.type,
            target: target,
            newContent: target.textContent
          });
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  console.log('👁️ Monitor de cambios DOM activado');
}

// Inicializar el script
console.log('🚀 Iniciando script de depuración de red y perfil...');

// Interceptar solicitudes de red
interceptNetworkRequests();

// Monitorear cambios en el DOM
monitorDOMChanges();

// Verificar estado inicial
checkCurrentDashboardState();

// Exponer funciones globalmente para uso manual
window.debugProfile = {
  checkState: checkCurrentDashboardState,
  simulateUpdate: simulateProfileUpdate,
  testData: {
    weight: '75.5',
    frequency: '4',
    objective: 'Ganar masa muscular y mejorar resistencia'
  }
};

console.log('✅ Script cargado. Usa window.debugProfile.simulateUpdate() para probar la actualización');
console.log('📋 También puedes usar window.debugProfile.checkState() para verificar el estado actual');