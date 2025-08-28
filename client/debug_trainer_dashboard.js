// Este script debe ejecutarse en la consola del navegador
// Abre el navegador, navega a http://localhost:5175/
// Abre las herramientas de desarrollo (F12 o Cmd+Option+I)
// Pega este script en la consola y presiona Enter

console.clear();
console.log('🔍 Depuración del componente TrainerDashboard');

// Función para esperar a que un elemento esté disponible en el DOM
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento ${selector} no encontrado después de ${timeout}ms`));
    }, timeout);
  });
}

// Función para acceder al estado interno de React
function getReactInstance(element) {
  const key = Object.keys(element).find(key => {
    return key.startsWith('__reactFiber$') || 
           key.startsWith('__reactInternalInstance$');
  });
  return element[key];
}

function getReactProps(element) {
  const key = Object.keys(element).find(key => {
    return key.startsWith('__reactProps$');
  });
  return element[key];
}

async function debugTrainerDashboard() {
  try {
    console.log('Esperando a que el dashboard se cargue...');
    await waitForElement('.trainer-dashboard');
    console.log('✅ Dashboard cargado');
    
    // Verificar si hay clientes en el DOM
    const clientsSection = document.querySelector('.clients-section');
    if (!clientsSection) {
      console.log('❌ Sección de clientes no encontrada');
      return;
    }
    console.log('✅ Sección de clientes encontrada');
    
    // Verificar si hay tarjetas de cliente
    const clientCards = document.querySelectorAll('.client-card');
    console.log(`Número de tarjetas de cliente: ${clientCards.length}`);
    
    if (clientCards.length > 0) {
      console.log('Clientes encontrados en el DOM:');
      clientCards.forEach((card, index) => {
        const nameElement = card.querySelector('.client-name');
        const name = nameElement ? nameElement.textContent : 'Nombre no encontrado';
        console.log(`Cliente ${index + 1}: ${name}`);
      });
    } else {
      const noClientsMessage = document.querySelector('.no-clients');
      if (noClientsMessage) {
        console.log('Mensaje de "no hay clientes" encontrado:');
        console.log(noClientsMessage.textContent.trim());
      } else {
        const loadingClients = document.querySelector('.loading-clients');
        if (loadingClients) {
          console.log('⚠️ Aún se están cargando los clientes');
        } else {
          console.log('❌ No se encontraron tarjetas de cliente ni mensaje de "no hay clientes"');
        }
      }
    }
    
    // Intentar acceder al estado de React
    try {
      console.log('\nIntentando acceder al estado interno de React...');
      const dashboardElement = document.querySelector('.trainer-dashboard');
      if (!dashboardElement) {
        console.log('❌ No se pudo encontrar el elemento del dashboard');
        return;
      }
      
      // Intentar encontrar el componente React
      const reactInstance = getReactInstance(dashboardElement);
      if (!reactInstance) {
        console.log('❌ No se pudo acceder a la instancia de React');
        return;
      }
      
      // Navegar por el árbol de fibras para encontrar el componente TrainerDashboard
      let fiber = reactInstance;
      let found = false;
      
      // Buscar en el árbol de fibras
      while (fiber) {
        // Verificar si es un componente con estado
        if (fiber.stateNode && fiber.stateNode.constructor && fiber.stateNode.constructor.name) {
          console.log(`Componente encontrado: ${fiber.stateNode.constructor.name}`);
          
          // Si es el TrainerDashboard o un componente que tenga el estado de clientes
          if (fiber.stateNode.state && fiber.stateNode.state.clients) {
            console.log('✅ Estado de clientes encontrado:');
            console.log('Número de clientes en el estado:', fiber.stateNode.state.clients.length);
            console.log('Clientes:', fiber.stateNode.state.clients);
            found = true;
            break;
          }
        }
        
        // Navegar al siguiente nodo
        fiber = fiber.return;
      }
      
      if (!found) {
        console.log('❌ No se pudo encontrar el estado de clientes en el árbol de React');
      }
    } catch (error) {
      console.error('Error al acceder al estado de React:', error);
    }
    
  } catch (error) {
    console.error('Error durante la depuración:', error);
  }
}

// Ejecutar la depuración
debugTrainerDashboard();