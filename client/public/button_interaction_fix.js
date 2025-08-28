/**
 * Script para diagnosticar y reparar problemas de interactividad de botones
 * y elementos de la interfaz de usuario
 */

class ButtonInteractionFix {
  constructor() {
    this.fixedElements = [];
    this.originalHandlers = new Map();
  }

  // Diagnosticar problemas de interactividad
  diagnoseInteractivity() {
    console.log('🔍 Diagnosticando problemas de interactividad...');
    
    const issues = [];
    
    // 1. Verificar botones sin event listeners
    const buttons = document.querySelectorAll('button');
    console.log(`📊 Total de botones encontrados: ${buttons.length}`);
    
    buttons.forEach((button, index) => {
      const hasHandler = this.hasEventHandler(button);
      const isDisabled = button.disabled;
      const hasPointerEvents = window.getComputedStyle(button).pointerEvents !== 'none';
      
      console.log(`🔘 Botón ${index + 1}:`, {
        text: button.textContent?.trim() || 'Sin texto',
        hasHandler,
        isDisabled,
        hasPointerEvents,
        className: button.className
      });
      
      if (!hasHandler && !isDisabled) {
        issues.push({
          type: 'missing_handler',
          element: button,
          description: `Botón sin event handler: "${button.textContent?.trim()}"`
        });
      }
      
      if (!hasPointerEvents) {
        issues.push({
          type: 'pointer_events_disabled',
          element: button,
          description: `Botón con pointer-events: none: "${button.textContent?.trim()}"`
        });
      }
    });
    
    // 2. Verificar elementos clickeables
    const clickableElements = document.querySelectorAll('[onclick], [data-testid*="card"], .card, .clickable');
    console.log(`📊 Elementos clickeables encontrados: ${clickableElements.length}`);
    
    clickableElements.forEach((element, index) => {
      const hasHandler = this.hasEventHandler(element);
      const hasPointerEvents = window.getComputedStyle(element).pointerEvents !== 'none';
      
      if (!hasHandler) {
        issues.push({
          type: 'missing_click_handler',
          element: element,
          description: `Elemento clickeable sin handler: ${element.tagName} "${element.textContent?.trim().substring(0, 30)}"`
        });
      }
    });
    
    // 3. Verificar overlays o elementos que bloquean la interacción
    const overlays = document.querySelectorAll('.overlay, .modal, .loading, [style*="z-index"]');
    overlays.forEach(overlay => {
      const zIndex = window.getComputedStyle(overlay).zIndex;
      const display = window.getComputedStyle(overlay).display;
      const visibility = window.getComputedStyle(overlay).visibility;
      
      if (display !== 'none' && visibility !== 'hidden' && parseInt(zIndex) > 1000) {
        issues.push({
          type: 'blocking_overlay',
          element: overlay,
          description: `Posible overlay bloqueante con z-index: ${zIndex}`
        });
      }
    });
    
    console.log(`🚨 Problemas encontrados: ${issues.length}`);
    issues.forEach(issue => {
      console.warn(`⚠️ ${issue.type}: ${issue.description}`);
    });
    
    return issues;
  }
  
  // Verificar si un elemento tiene event handlers
  hasEventHandler(element) {
    // Verificar onclick attribute
    if (element.onclick || element.getAttribute('onclick')) {
      return true;
    }
    
    // Verificar React event handlers (propiedades que empiecen con 'on')
    const props = Object.getOwnPropertyNames(element);
    for (const prop of props) {
      if (prop.startsWith('__reactEventHandlers') || 
          prop.startsWith('__reactInternalInstance') ||
          prop.startsWith('_reactInternalFiber')) {
        return true;
      }
    }
    
    // Verificar si tiene event listeners registrados
    const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
    for (const event of events) {
      if (element[`on${event}`]) {
        return true;
      }
    }
    
    return false;
  }
  
  // Reparar problemas de interactividad
  fixInteractivityIssues() {
    console.log('🔧 Reparando problemas de interactividad...');
    
    const issues = this.diagnoseInteractivity();
    let fixedCount = 0;
    
    issues.forEach(issue => {
      switch(issue.type) {
        case 'missing_handler':
          this.addGenericClickHandler(issue.element);
          fixedCount++;
          break;
          
        case 'missing_click_handler':
          this.addGenericClickHandler(issue.element);
          fixedCount++;
          break;
          
        case 'pointer_events_disabled':
          issue.element.style.pointerEvents = 'auto';
          console.log('✅ Habilitado pointer-events para:', issue.element);
          fixedCount++;
          break;
          
        case 'blocking_overlay':
          // Reducir z-index o ocultar overlay problemático
          const currentZIndex = window.getComputedStyle(issue.element).zIndex;
          if (parseInt(currentZIndex) > 1000) {
            issue.element.style.zIndex = '1';
            console.log('✅ Reducido z-index de overlay bloqueante:', issue.element);
            fixedCount++;
          }
          break;
      }
    });
    
    console.log(`🎉 Problemas reparados: ${fixedCount}`);
    return fixedCount;
  }
  
  // Añadir handler genérico a elementos
  addGenericClickHandler(element) {
    // Guardar handler original si existe
    if (element.onclick) {
      this.originalHandlers.set(element, element.onclick);
    }
    
    // Determinar acción basada en el elemento
    let action = 'click genérico';
    const text = element.textContent?.trim().toLowerCase() || '';
    const className = element.className.toLowerCase();
    
    if (text.includes('rutina') || className.includes('routine')) {
      action = 'cargar rutina';
    } else if (text.includes('ejercicio') || className.includes('exercise')) {
      action = 'mostrar ejercicio';
    } else if (text.includes('perfil') || className.includes('profile')) {
      action = 'editar perfil';
    } else if (text.includes('guardar') || text.includes('save')) {
      action = 'guardar cambios';
    }
    
    // Añadir event listener
    const handler = (event) => {
      console.log(`🖱️ Click detectado en: ${action}`, element);
      
      // Ejecutar handler original si existe
      const originalHandler = this.originalHandlers.get(element);
      if (originalHandler) {
        try {
          originalHandler.call(element, event);
        } catch (error) {
          console.error('❌ Error en handler original:', error);
        }
      }
      
      // Intentar trigger de eventos React
      this.triggerReactEvent(element, event);
      
      // Prevenir comportamiento por defecto si es necesario
      if (element.tagName === 'BUTTON' && element.type !== 'submit') {
        event.preventDefault();
      }
    };
    
    element.addEventListener('click', handler);
    this.fixedElements.push({ element, handler, action });
    
    console.log(`✅ Añadido handler para: ${action}`, element);
  }
  
  // Intentar trigger de eventos React
  triggerReactEvent(element, event) {
    try {
      // Buscar instancia de React
      const reactInstance = element._reactInternalFiber || 
                           element._reactInternalInstance ||
                           element.__reactInternalInstance;
      
      if (reactInstance) {
        // Intentar encontrar props con handlers
        const props = reactInstance.memoizedProps || reactInstance.props;
        if (props && props.onClick) {
          console.log('🔄 Ejecutando handler de React...');
          props.onClick(event);
          return true;
        }
      }
      
      // Método alternativo: buscar en el DOM parent
      let parent = element.parentElement;
      while (parent) {
        const parentReact = parent._reactInternalFiber || 
                           parent._reactInternalInstance ||
                           parent.__reactInternalInstance;
        
        if (parentReact && parentReact.memoizedProps && parentReact.memoizedProps.onClick) {
          console.log('🔄 Ejecutando handler de React del parent...');
          parentReact.memoizedProps.onClick(event);
          return true;
        }
        
        parent = parent.parentElement;
      }
    } catch (error) {
      console.warn('⚠️ No se pudo ejecutar handler de React:', error);
    }
    
    return false;
  }
  
  // Forzar re-renderizado de componentes React
  forceReactRerender() {
    console.log('🔄 Forzando re-renderizado de React...');
    
    try {
      // Buscar root de React
      const reactRoot = document.querySelector('#root');
      if (reactRoot) {
        const reactInstance = reactRoot._reactRootContainer ||
                             reactRoot._reactInternalFiber ||
                             reactRoot.__reactInternalInstance;
        
        if (reactInstance) {
          // Intentar forzar update
          if (reactInstance.forceUpdate) {
            reactInstance.forceUpdate();
            console.log('✅ Re-renderizado forzado exitoso');
            return true;
          }
        }
      }
      
      // Método alternativo: dispatch de evento personalizado
      window.dispatchEvent(new CustomEvent('forceReactUpdate'));
      console.log('✅ Evento de re-renderizado disparado');
      
    } catch (error) {
      console.error('❌ Error al forzar re-renderizado:', error);
    }
    
    return false;
  }
  
  // Restaurar handlers originales
  restoreOriginalHandlers() {
    console.log('🔄 Restaurando handlers originales...');
    
    this.fixedElements.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
      
      const originalHandler = this.originalHandlers.get(element);
      if (originalHandler) {
        element.onclick = originalHandler;
      }
    });
    
    this.fixedElements = [];
    this.originalHandlers.clear();
    
    console.log('✅ Handlers restaurados');
  }
  
  // Monitorear cambios en el DOM
  startDOMMonitoring() {
    console.log('👀 Iniciando monitoreo del DOM...');
    
    const observer = new MutationObserver((mutations) => {
      let needsFix = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const buttons = node.querySelectorAll ? node.querySelectorAll('button') : [];
              if (buttons.length > 0 || node.tagName === 'BUTTON') {
                needsFix = true;
              }
            }
          });
        }
      });
      
      if (needsFix) {
        console.log('🔄 Nuevos elementos detectados, aplicando fixes...');
        setTimeout(() => this.fixInteractivityIssues(), 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.domObserver = observer;
    console.log('✅ Monitoreo del DOM iniciado');
  }
  
  // Detener monitoreo del DOM
  stopDOMMonitoring() {
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = null;
      console.log('⏹️ Monitoreo del DOM detenido');
    }
  }
  
  // Ejecutar reparación completa
  runCompleteRepair() {
    console.log('🚀 Ejecutando reparación completa de interactividad...');
    console.log('=' .repeat(50));
    
    // 1. Diagnosticar problemas
    const issues = this.diagnoseInteractivity();
    
    // 2. Reparar problemas
    const fixedCount = this.fixInteractivityIssues();
    
    // 3. Forzar re-renderizado
    this.forceReactRerender();
    
    // 4. Iniciar monitoreo
    this.startDOMMonitoring();
    
    console.log('\n📊 RESUMEN DE REPARACIÓN:');
    console.log(`🔍 Problemas encontrados: ${issues.length}`);
    console.log(`🔧 Problemas reparados: ${fixedCount}`);
    console.log('👀 Monitoreo del DOM: Activo');
    
    if (fixedCount > 0) {
      console.log('\n🎉 ¡Reparación completada! Los botones deberían funcionar ahora.');
    } else {
      console.log('\n💡 No se encontraron problemas obvios. El problema puede ser más específico.');
    }
    
    return { issues: issues.length, fixed: fixedCount };
  }
}

// Crear instancia global
window.buttonInteractionFix = new ButtonInteractionFix();

// Ejecutar reparación automática después de que la página cargue
setTimeout(() => {
  console.log('🔧 Ejecutando reparación automática de interactividad...');
  window.buttonInteractionFix.runCompleteRepair();
}, 3000);

// Comandos disponibles en la consola
console.log('\n🛠️ COMANDOS DE REPARACIÓN DE INTERACTIVIDAD:');
console.log('buttonInteractionFix.runCompleteRepair() - Reparación completa');
console.log('buttonInteractionFix.diagnoseInteractivity() - Solo diagnóstico');
console.log('buttonInteractionFix.fixInteractivityIssues() - Solo reparación');
console.log('buttonInteractionFix.forceReactRerender() - Forzar re-renderizado');
console.log('buttonInteractionFix.restoreOriginalHandlers() - Restaurar handlers originales');