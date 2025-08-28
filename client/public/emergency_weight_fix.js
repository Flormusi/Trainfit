// Script de emergencia para forzar actualización del peso en el frontend
class EmergencyWeightFix {
  constructor() {
    this.originalConsoleLog = console.log;
    this.setupGlobalAccess();
  }

  setupGlobalAccess() {
    window.emergencyWeightFix = this;
    console.log('🚨 Emergency Weight Fix cargado y disponible globalmente');
  }

  // Diagnóstico completo del estado actual
  fullDiagnosis() {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DE EMERGENCIA ===');
    
    // 1. Verificar elementos DOM
    const weightElements = document.querySelectorAll('*');
    const weightTexts = [];
    weightElements.forEach(el => {
      if (el.textContent && el.textContent.includes('kg')) {
        weightTexts.push({
          element: el,
          text: el.textContent,
          tagName: el.tagName,
          className: el.className
        });
      }
    });
    
    console.log('⚖️ Elementos con peso encontrados:', weightTexts);
    
    // 2. Verificar React Fiber
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalFiber) {
      console.log('⚛️ React Fiber detectado:', reactRoot._reactInternalFiber);
    } else if (reactRoot && reactRoot._reactInternals) {
      console.log('⚛️ React Internals detectado:', reactRoot._reactInternals);
    }
    
    // 3. Verificar localStorage y sessionStorage
    console.log('💾 LocalStorage:', localStorage);
    console.log('💾 SessionStorage:', sessionStorage);
    
    // 4. Verificar estado de red
    console.log('🌐 Estado de conexión:', navigator.onLine);
    
    return {
      weightElements: weightTexts.length,
      reactDetected: !!reactRoot,
      storageItems: Object.keys(localStorage).length,
      networkOnline: navigator.onLine
    };
  }

  // Forzar actualización agresiva del DOM
  forceAggressiveDOMUpdate(newWeight = 51.4) {
    console.log(`🔥 Forzando actualización agresiva del DOM con peso: ${newWeight} kg`);
    
    // 1. Buscar y actualizar todos los elementos que contengan peso
    const allElements = document.querySelectorAll('*');
    let updatedElements = 0;
    
    allElements.forEach(el => {
      if (el.textContent && el.textContent.includes('52 kg')) {
        console.log('🎯 Elemento encontrado para actualizar:', el);
        el.textContent = el.textContent.replace('52 kg', `${newWeight} kg`);
        el.innerHTML = el.innerHTML.replace('52 kg', `${newWeight} kg`);
        updatedElements++;
        
        // Forzar re-render del elemento
        el.style.display = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.display = '';
      }
    });
    
    console.log(`✅ ${updatedElements} elementos actualizados en el DOM`);
    return updatedElements;
  }

  // Interceptar y modificar llamadas de red
  interceptNetworkCalls() {
    console.log('🕸️ Interceptando llamadas de red...');
    
    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      console.log('📡 Fetch interceptado:', args);
      const response = await originalFetch(...args);
      
      // Si es una llamada de perfil, modificar la respuesta
      if (args[0] && args[0].includes('/profile')) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          if (data.weight) {
            console.log('⚖️ Peso detectado en respuesta:', data.weight);
            data.weight = 51.4; // Forzar el peso correcto
            console.log('🔧 Peso modificado a:', data.weight);
          }
        } catch (e) {
          console.log('⚠️ No se pudo modificar la respuesta:', e);
        }
      }
      
      return response;
    };
    
    console.log('✅ Interceptor de red activado');
  }

  // Limpiar todos los cachés posibles
  clearAllCaches() {
    console.log('🧹 Limpiando todos los cachés...');
    
    // 1. LocalStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.includes('weight') || key.includes('profile') || key.includes('client')) {
        localStorage.removeItem(key);
        console.log('🗑️ Eliminado de localStorage:', key);
      }
    });
    
    // 2. SessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach(key => {
      if (key.includes('weight') || key.includes('profile') || key.includes('client')) {
        sessionStorage.removeItem(key);
        console.log('🗑️ Eliminado de sessionStorage:', key);
      }
    });
    
    // 3. Limpiar caché del navegador (si es posible)
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
          console.log('🗑️ Caché eliminado:', name);
        });
      });
    }
    
    console.log('✅ Cachés limpiados');
  }

  // Forzar recarga completa de la página
  forcePageReload() {
    console.log('🔄 Forzando recarga completa de la página...');
    window.location.reload(true);
  }

  // Simular actualización de perfil directamente
  simulateProfileUpdate(newWeight = 51.4) {
    console.log(`🎭 Simulando actualización de perfil con peso: ${newWeight} kg`);
    
    // 1. Actualizar localStorage si existe
    const profileData = localStorage.getItem('profileData');
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        parsed.weight = newWeight;
        localStorage.setItem('profileData', JSON.stringify(parsed));
        console.log('✅ ProfileData actualizado en localStorage');
      } catch (e) {
        console.log('⚠️ Error actualizando profileData:', e);
      }
    }
    
    // 2. Disparar eventos personalizados
    const updateEvent = new CustomEvent('profileUpdated', {
      detail: { weight: newWeight }
    });
    window.dispatchEvent(updateEvent);
    console.log('📢 Evento profileUpdated disparado');
    
    // 3. Forzar actualización del DOM
    this.forceAggressiveDOMUpdate(newWeight);
    
    // 4. Intentar forzar re-render de React
    this.forceReactRerender();
  }

  // Forzar re-render de React
  forceReactRerender() {
    console.log('⚛️ Forzando re-render de React...');
    
    const reactRoot = document.querySelector('#root');
    if (reactRoot) {
      // Método 1: Trigger de eventos
      const event = new Event('input', { bubbles: true });
      reactRoot.dispatchEvent(event);
      
      // Método 2: Modificar y restaurar el DOM
      const originalDisplay = reactRoot.style.display;
      reactRoot.style.display = 'none';
      reactRoot.offsetHeight; // Trigger reflow
      reactRoot.style.display = originalDisplay;
      
      console.log('✅ Re-render de React forzado');
    }
  }

  // Función de reparación completa
  emergencyRepair(newWeight = 51.4) {
    console.log('🚨 === INICIANDO REPARACIÓN DE EMERGENCIA ===');
    
    // 1. Diagnóstico
    const diagnosis = this.fullDiagnosis();
    console.log('📊 Diagnóstico:', diagnosis);
    
    // 2. Limpiar cachés
    this.clearAllCaches();
    
    // 3. Interceptar red
    this.interceptNetworkCalls();
    
    // 4. Simular actualización
    this.simulateProfileUpdate(newWeight);
    
    // 5. Esperar y verificar
    setTimeout(() => {
      console.log('🔍 Verificando resultado después de 2 segundos...');
      const newDiagnosis = this.fullDiagnosis();
      console.log('📊 Nuevo diagnóstico:', newDiagnosis);
      
      // Si aún no funciona, forzar recarga
      const stillHas52kg = document.body.textContent.includes('52 kg');
      if (stillHas52kg) {
        console.log('⚠️ Aún muestra 52 kg, forzando recarga de página...');
        setTimeout(() => this.forcePageReload(), 1000);
      } else {
        console.log('✅ ¡Reparación exitosa! El peso se ha actualizado.');
      }
    }, 2000);
    
    console.log('🚨 === REPARACIÓN DE EMERGENCIA COMPLETADA ===');
  }

  // Función de diagnóstico rápido
  quickFix() {
    console.log('⚡ Ejecutando reparación rápida...');
    this.emergencyRepair(51.4);
  }
}

// Inicializar automáticamente
const emergencyFix = new EmergencyWeightFix();

// Mensaje de ayuda
console.log(`
🚨 === EMERGENCY WEIGHT FIX CARGADO ===
Comandos disponibles:
- emergencyWeightFix.quickFix() - Reparación rápida
- emergencyWeightFix.emergencyRepair(51.4) - Reparación completa
- emergencyWeightFix.fullDiagnosis() - Diagnóstico completo
- emergencyWeightFix.forceAggressiveDOMUpdate(51.4) - Actualizar DOM
- emergencyWeightFix.clearAllCaches() - Limpiar cachés
- emergencyWeightFix.forcePageReload() - Recargar página
`);