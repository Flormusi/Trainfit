// SCRIPT DEFINITIVO PARA SOLUCIONAR EL PROBLEMA DE ACTUALIZACIÓN DE PESO
// Se carga automáticamente en la página

console.log('🎯 ULTIMATE WEIGHT FIX - Script de reparación definitivo cargado');

class UltimateWeightFix {
  constructor() {
    this.debugMode = true;
    this.attempts = 0;
    this.maxAttempts = 5;
    this.originalWeight = null;
    this.targetWeight = null;
  }

  log(message, type = 'info') {
    if (!this.debugMode) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  // 1. Verificar estado actual
  async checkCurrentState() {
    this.log('Verificando estado actual del componente...', 'debug');
    
    const dashboardElement = document.querySelector('.client-dashboard-page');
    if (!dashboardElement) {
      this.log('No se encontró el elemento del dashboard', 'error');
      return false;
    }

    // Buscar el peso actual en la interfaz
    const weightElements = [
      document.querySelector('[data-testid="current-weight"]'),
      document.querySelector('.weight-display'),
      document.querySelector('.current-weight'),
      ...document.querySelectorAll('*')
    ].filter(el => el && el.textContent && el.textContent.includes('kg'));

    this.log(`Elementos con peso encontrados: ${weightElements.length}`, 'debug');
    
    weightElements.forEach((el, index) => {
      this.log(`Peso ${index + 1}: ${el.textContent.trim()}`, 'debug');
    });

    return true;
  }

  // 2. Interceptar y monitorear llamadas de red
  setupNetworkInterception() {
    this.log('Configurando interceptación de red...', 'debug');
    
    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      if (url.includes('/api/') || url.includes('profile') || url.includes('user')) {
        this.log(`🌐 Fetch interceptado: ${url}`, 'debug');
        
        if (options && options.method === 'PUT') {
          this.log(`📤 PUT Request body: ${options.body}`, 'debug');
        }
      }
      
      const response = await originalFetch(...args);
      
      if (url.includes('/api/') || url.includes('profile') || url.includes('user')) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          this.log(`📥 Response data: ${JSON.stringify(data)}`, 'debug');
        } catch (e) {
          this.log(`📥 Response (no JSON): ${response.status}`, 'debug');
        }
      }
      
      return response;
    };

    this.log('Interceptación de red configurada', 'success');
  }

  // 3. Forzar actualización del componente React
  async forceReactUpdate() {
    this.log('Forzando actualización de React...', 'debug');
    
    // Método 1: Disparar eventos en el elemento raíz
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const events = ['focus', 'blur', 'resize', 'scroll', 'click'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        rootElement.dispatchEvent(event);
      });
    }

    // Método 2: Forzar re-render usando React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.renderers) {
        hook.renderers.forEach(renderer => {
          if (renderer.scheduleUpdate) {
            try {
              renderer.scheduleUpdate();
              this.log('React DevTools update scheduled', 'success');
            } catch (e) {
              this.log(`Error scheduling update: ${e.message}`, 'error');
            }
          }
        });
      }
    }

    // Método 3: Manipular el DOM para forzar re-render
    const dashboardElement = document.querySelector('.client-dashboard-page');
    if (dashboardElement) {
      const parent = dashboardElement.parentNode;
      const nextSibling = dashboardElement.nextSibling;
      
      parent.removeChild(dashboardElement);
      
      setTimeout(() => {
        parent.insertBefore(dashboardElement, nextSibling);
        this.log('DOM manipulation completed', 'success');
      }, 100);
    }

    // Método 4: Forzar actualización de estado usando eventos personalizados
    window.dispatchEvent(new CustomEvent('forceUpdate', { 
      detail: { timestamp: Date.now(), source: 'ultimateWeightFix' }
    }));

    this.log('Actualización de React forzada', 'success');
  }

  // 4. Limpiar cachés y storage
  clearAllCaches() {
    this.log('Limpiando todos los cachés...', 'debug');
    
    // LocalStorage
    const localKeys = Object.keys(localStorage);
    this.log(`LocalStorage keys: ${localKeys.join(', ')}`, 'debug');
    
    // Guardar datos importantes antes de limpiar
    const importantData = {
      authToken: localStorage.getItem('authToken') || localStorage.getItem('token'),
      userId: localStorage.getItem('userId') || localStorage.getItem('user_id')
    };
    
    localStorage.clear();
    
    // Restaurar datos importantes
    if (importantData.authToken) {
      localStorage.setItem('authToken', importantData.authToken);
    }
    if (importantData.userId) {
      localStorage.setItem('userId', importantData.userId);
    }
    
    // SessionStorage
    sessionStorage.clear();
    
    // Cache API
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      });
    }
    
    this.log('Cachés limpiados', 'success');
  }

  // 5. Simular actualización de perfil
  async simulateProfileUpdate(newWeight) {
    this.log(`Simulando actualización de perfil con peso: ${newWeight}kg`, 'debug');
    
    try {
      // Buscar el botón de editar perfil
      const editButtons = [
        document.querySelector('[data-testid="edit-profile"]'),
        document.querySelector('.edit-profile-btn'),
        document.querySelector('button[class*="edit"]'),
        ...Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.toLowerCase().includes('editar') || 
          btn.textContent.toLowerCase().includes('edit')
        )
      ].filter(Boolean);

      if (editButtons.length === 0) {
        this.log('No se encontró botón de editar perfil', 'error');
        return false;
      }

      this.log(`Encontrados ${editButtons.length} botones de edición`, 'debug');
      
      // Hacer clic en el primer botón encontrado
      editButtons[0].click();
      
      // Esperar a que aparezca el modal/formulario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar el campo de peso
      const weightInputs = [
        document.querySelector('input[name="weight"]'),
        document.querySelector('input[name="peso"]'),
        document.querySelector('#weight'),
        document.querySelector('#peso'),
        ...Array.from(document.querySelectorAll('input[type="number"]')).filter(input => 
          input.placeholder && (input.placeholder.toLowerCase().includes('peso') || input.placeholder.toLowerCase().includes('weight'))
        )
      ].filter(Boolean);

      if (weightInputs.length === 0) {
        this.log('No se encontró campo de peso', 'error');
        return false;
      }

      const weightInput = weightInputs[0];
      this.originalWeight = weightInput.value;
      this.targetWeight = newWeight;
      
      this.log(`Peso original: ${this.originalWeight}kg, Peso objetivo: ${this.targetWeight}kg`, 'debug');
      
      // Actualizar el campo de peso
      weightInput.focus();
      weightInput.select();
      weightInput.value = newWeight;
      
      // Disparar eventos de cambio
      ['input', 'change', 'blur'].forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        weightInput.dispatchEvent(event);
      });
      
      // Buscar y hacer clic en el botón de guardar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const saveButtons = [
        document.querySelector('[data-testid="save-profile"]'),
        document.querySelector('.save-btn'),
        document.querySelector('button[type="submit"]'),
        ...Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.toLowerCase().includes('guardar') || 
          btn.textContent.toLowerCase().includes('save')
        )
      ].filter(Boolean);

      if (saveButtons.length > 0) {
        this.log('Haciendo clic en guardar...', 'debug');
        saveButtons[0].click();
        return true;
      } else {
        this.log('No se encontró botón de guardar', 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`Error en simulación: ${error.message}`, 'error');
      return false;
    }
  }

  // 6. Verificar si la actualización fue exitosa
  async verifyUpdate() {
    this.log('Verificando actualización...', 'debug');
    
    // Esperar un poco para que se procese la actualización
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Buscar elementos que muestren el peso
    const weightElements = document.querySelectorAll('*');
    let foundTargetWeight = false;
    
    weightElements.forEach(el => {
      if (el.textContent && el.textContent.includes(`${this.targetWeight}kg`)) {
        foundTargetWeight = true;
        this.log(`✅ Peso actualizado encontrado en: ${el.tagName}.${el.className}`, 'success');
      }
    });
    
    if (!foundTargetWeight && this.targetWeight) {
      this.log(`❌ No se encontró el peso objetivo ${this.targetWeight}kg en la interfaz`, 'error');
      return false;
    }
    
    return foundTargetWeight;
  }

  // 7. Función principal de reparación
  async run(newWeight = null) {
    this.log('🚀 Iniciando Ultimate Weight Fix...', 'info');
    this.attempts++;
    
    if (this.attempts > this.maxAttempts) {
      this.log('❌ Máximo número de intentos alcanzado', 'error');
      return false;
    }
    
    try {
      // Paso 1: Verificar estado actual
      const stateOk = await this.checkCurrentState();
      if (!stateOk) {
        this.log('❌ Estado inicial no válido', 'error');
        return false;
      }
      
      // Paso 2: Configurar interceptación de red
      this.setupNetworkInterception();
      
      // Paso 3: Limpiar cachés
      this.clearAllCaches();
      
      // Paso 4: Si se proporciona un nuevo peso, simular actualización
      if (newWeight) {
        const updateSuccess = await this.simulateProfileUpdate(newWeight);
        if (!updateSuccess) {
          this.log('❌ Falló la simulación de actualización', 'error');
        }
        
        // Esperar y verificar
        await new Promise(resolve => setTimeout(resolve, 3000));
        const verifySuccess = await this.verifyUpdate();
        
        if (verifySuccess) {
          this.log('🎉 ¡Actualización exitosa!', 'success');
          return true;
        }
      }
      
      // Paso 5: Forzar actualización de React
      await this.forceReactUpdate();
      
      // Paso 6: Si todo falla, recargar la página
      if (this.attempts >= 3) {
        this.log('🔄 Recargando página como último recurso...', 'warning');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
      this.log('✅ Proceso de reparación completado', 'success');
      return true;
      
    } catch (error) {
      this.log(`❌ Error durante la reparación: ${error.message}`, 'error');
      
      // Reintentar después de un delay
      if (this.attempts < this.maxAttempts) {
        this.log(`🔄 Reintentando en 3 segundos... (Intento ${this.attempts + 1}/${this.maxAttempts})`, 'warning');
        setTimeout(() => this.run(newWeight), 3000);
      }
      
      return false;
    }
  }

  // 8. Función de diagnóstico rápido
  quickDiagnosis() {
    this.log('🔍 Ejecutando diagnóstico rápido...', 'info');
    
    const results = {
      dashboardFound: !!document.querySelector('.client-dashboard-page'),
      reactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
      authToken: !!(localStorage.getItem('authToken') || localStorage.getItem('token')),
      networkOnline: navigator.onLine,
      weightElements: document.querySelectorAll('*').length
    };
    
    this.log('📊 Resultados del diagnóstico:', 'info');
    Object.entries(results).forEach(([key, value]) => {
      this.log(`  ${key}: ${value}`, value ? 'success' : 'error');
    });
    
    return results;
  }
}

// Crear instancia global
window.ultimateWeightFix = new UltimateWeightFix();

console.log('\n🎯 ULTIMATE WEIGHT FIX CARGADO');
console.log('📋 Comandos disponibles:');
console.log('  ultimateWeightFix.run() - Ejecutar reparación completa');
console.log('  ultimateWeightFix.run(51.4) - Actualizar peso a 51.4kg');
console.log('  ultimateWeightFix.quickDiagnosis() - Diagnóstico rápido');
console.log('  ultimateWeightFix.clearAllCaches() - Limpiar cachés');
console.log('  ultimateWeightFix.forceReactUpdate() - Forzar actualización React');
console.log('\n💡 Uso recomendado: ultimateWeightFix.run(51.4)');

// Auto-ejecutar diagnóstico
window.ultimateWeightFix.quickDiagnosis();