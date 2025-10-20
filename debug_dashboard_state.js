// Este script debe ejecutarse en la consola del navegador
// Abre el navegador, navega a http://localhost:5173/
// Abre las herramientas de desarrollo (F12 o Cmd+Option+I)
// Pega este script en la consola y presiona Enter

console.clear();
console.log('🔍 Depuración del estado de clientes en TrainerDashboard');

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

// Función para agregar un hook para interceptar las llamadas a la API
function setupApiInterceptor() {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('/trainer/clients')) {
      console.log('🔍 Interceptando llamada a /trainer/clients');
      const response = await originalFetch.apply(this, args);
      const cloneResponse = response.clone();
      try {
        const data = await cloneResponse.json();
        console.log('Respuesta de /trainer/clients:', data);
        
        // Verificar la estructura de la respuesta
        if (data && data.data && data.data.clients) {
          console.log('Estructura anidada detectada: data.data.clients');
          console.log('Clientes:', data.data.clients);
        } else if (Array.isArray(data)) {
          console.log('Respuesta es un array de clientes');
          console.log('Clientes:', data);
        } else {
          console.log('Estructura no reconocida');
        }
      } catch (error) {
        console.error('Error al procesar la respuesta:', error);
      }
      return response;
    }
    return originalFetch.apply(this, args);
  };
  console.log('✅ Interceptor de API configurado');
}

// Función para inspeccionar el estado de React
async function inspectReactState() {
  try {
    // Configurar interceptor de API
    setupApiInterceptor();
    
    // Esperar a que el dashboard se cargue
    await waitForElement('.trainer-dashboard');
    console.log('✅ Elemento .trainer-dashboard encontrado');
    
    // Verificar si hay clientes en la lista
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
      // Mostrar información de cada cliente
      console.log('Clientes encontrados:');
      clientCards.forEach((card, index) => {
        const nameElement = card.querySelector('.client-name');
        const name = nameElement ? nameElement.textContent : 'Nombre no encontrado';
        console.log(`Cliente ${index + 1}: ${name}`);
      });
    } else {
      // Verificar si se muestra el mensaje de "no hay clientes"
      const noClientsMessage = document.querySelector('.no-clients');
      if (noClientsMessage) {
        console.log('Mensaje de "no hay clientes" encontrado:');
        console.log(noClientsMessage.textContent);
      } else {
        console.log('❌ No se encontraron tarjetas de cliente ni mensaje de "no hay clientes"');
      }
    }
    
    // Verificar el estado de carga
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      console.log('⚠️ El dashboard aún está en estado de carga');
    }
    
    // Forzar una recarga de la página después de 5 segundos para ver si eso ayuda
    console.log('Esperando 5 segundos y luego recargando la página...');
    setTimeout(() => {
      console.log('Recargando la página...');
      window.location.reload();
    }, 5000);
    
  } catch (error) {
    console.error('Error durante la inspección:', error);
  }
}

// Ejecutar la inspección
inspectReactState();