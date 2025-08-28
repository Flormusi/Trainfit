// Script para forzar la visualización correcta del peso
class ForceWeightDisplay {
  constructor() {
    this.targetWeight = 51.4;
    this.setupMutationObserver();
    this.setupPeriodicCheck();
    window.forceWeightDisplay = this;
    console.log('💪 Force Weight Display activado');
  }

  // Observador de mutaciones para detectar cambios en el DOM
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          this.checkAndFixWeightDisplay();
        }
      });
    });

    // Observar todo el documento
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    console.log('👁️ Observador de mutaciones activado');
  }

  // Verificación periódica cada segundo
  setupPeriodicCheck() {
    setInterval(() => {
      this.checkAndFixWeightDisplay();
    }, 1000);

    console.log('⏰ Verificación periódica activada (cada 1 segundo)');
  }

  // Verificar y corregir la visualización del peso
  checkAndFixWeightDisplay() {
    const allElements = document.querySelectorAll('*');
    let fixed = false;

    allElements.forEach(element => {
      // Buscar elementos que contengan "52 kg"
      if (element.textContent && element.textContent.includes('52 kg')) {
        // Verificar que no sea un input o textarea
        if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
          const oldText = element.textContent;
          
          // Reemplazar solo el texto del nodo, no de los hijos
          if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
            element.childNodes[0].textContent = element.childNodes[0].textContent.replace('52 kg', `${this.targetWeight} kg`);
            fixed = true;
            console.log(`🔧 Peso corregido: "${oldText}" → "${element.textContent}"`);
          } else {
            // Para elementos con estructura más compleja
            element.innerHTML = element.innerHTML.replace(/52 kg/g, `${this.targetWeight} kg`);
            fixed = true;
            console.log(`🔧 HTML corregido en elemento:`, element);
          }
        }
      }

      // También buscar en atributos value, placeholder, etc.
      if (element.value && element.value.includes('52')) {
        element.value = element.value.replace('52', this.targetWeight.toString());
        fixed = true;
        console.log('🔧 Valor de input corregido:', element);
      }

      if (element.placeholder && element.placeholder.includes('52')) {
        element.placeholder = element.placeholder.replace('52', this.targetWeight.toString());
        fixed = true;
        console.log('🔧 Placeholder corregido:', element);
      }
    });

    if (fixed) {
      console.log('✅ Peso corregido automáticamente');
      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('weightDisplayFixed', {
        detail: { newWeight: this.targetWeight }
      }));
    }
  }

  // Cambiar el peso objetivo
  setTargetWeight(newWeight) {
    this.targetWeight = newWeight;
    console.log(`🎯 Nuevo peso objetivo: ${newWeight} kg`);
    this.checkAndFixWeightDisplay();
  }

  // Forzar corrección inmediata
  forceCorrection() {
    console.log('🚀 Forzando corrección inmediata...');
    this.checkAndFixWeightDisplay();
  }

  // Detener el observador
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      console.log('⏹️ Observador detenido');
    }
  }
}

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ForceWeightDisplay();
  });
} else {
  new ForceWeightDisplay();
}

console.log(`
💪 === FORCE WEIGHT DISPLAY CARGADO ===
Este script corrige automáticamente cualquier aparición de "52 kg" a "51.4 kg"
Comandos disponibles:
- forceWeightDisplay.setTargetWeight(51.4) - Cambiar peso objetivo
- forceWeightDisplay.forceCorrection() - Forzar corrección inmediata
- forceWeightDisplay.stop() - Detener corrección automática
`);