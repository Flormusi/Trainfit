// Este script debe ejecutarse en la consola del navegador
// Abre el navegador, navega a http://localhost:5174/
// Abre las herramientas de desarrollo (F12 o Cmd+Option+I)
// Pega este script en la consola y presiona Enter

console.clear();
console.log('🔍 Depuración de la estructura de clientes en el navegador');

// Función para interceptar las llamadas a la API
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
          
          // Buscar cliente específico
          const florenciaClient = data.data.clients.find(client => client.email === 'florenciamusitani@gmail.com');
          if (florenciaClient) {
            console.log('✅ Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
          } else {
            console.log('❌ Cliente florenciamusitani@gmail.com NO encontrado');
          }
        } else if (Array.isArray(data)) {
          console.log('Respuesta es un array de clientes');
          console.log('Clientes:', data);
          
          // Buscar cliente específico
          const florenciaClient = data.find(client => client.email === 'florenciamusitani@gmail.com');
          if (florenciaClient) {
            console.log('✅ Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
          } else {
            console.log('❌ Cliente florenciamusitani@gmail.com NO encontrado');
          }
        } else if (data && Array.isArray(data.data)) {
          console.log('Estructura data.data es un array');
          console.log('Clientes:', data.data);
          
          // Buscar cliente específico
          const florenciaClient = data.data.find(client => client.email === 'florenciamusitani@gmail.com');
          if (florenciaClient) {
            console.log('✅ Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
          } else {
            console.log('❌ Cliente florenciamusitani@gmail.com NO encontrado');
          }
        } else {
          console.log('❌ Estructura no reconocida');
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
function inspectReactState() {
  // Verificar si hay clientes en el DOM
  const clientCards = document.querySelectorAll('.client-card');
  console.log(`Número de tarjetas de cliente en el DOM: ${clientCards.length}`);
  
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
      console.log('❌ No se encontraron tarjetas de cliente ni mensaje de "no hay clientes"');
      
      // Verificar si está cargando
      const loadingElement = document.querySelector('.loading-clients, .loading-spinner');
      if (loadingElement) {
        console.log('⚠️ El dashboard aún está en estado de carga');
      }
    }
  }
  
  // Verificar si hay errores en la consola
  console.log('\nVerificando errores en la consola...');
  if (window.console.error.toString().includes('native code')) {
    console.log('✅ No se detectaron errores personalizados en la consola');
  } else {
    console.log('⚠️ La función console.error ha sido modificada, no se puede verificar automáticamente');
  }
}

// Ejecutar la depuración
setupApiInterceptor();
console.log('\nEsperando 2 segundos para que se carguen los datos...');
setTimeout(() => {
  console.log('\nInspeccionando el estado actual del DOM:');
  inspectReactState();
  
  console.log('\nPara forzar una recarga de la página y ver los datos interceptados, ejecuta:');
  console.log('window.location.reload();');
}, 2000);