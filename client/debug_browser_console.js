// Este script debe ejecutarse en la consola del navegador
// Abre el navegador, navega a http://localhost:5173/
// Abre las herramientas de desarrollo (F12 o Cmd+Option+I)
// Pega este script en la consola y presiona Enter

console.clear();
console.log('🔍 Depuración del TrainerDashboard');

// Verificar si hay errores en la consola
const originalConsoleError = console.error;
console.error = function(...args) {
  console.log('⚠️ ERROR DETECTADO:', ...args);
  originalConsoleError.apply(console, args);
};

// Esperar a que se cargue la página y luego verificar el estado
setTimeout(() => {
  // Verificar si el componente TrainerDashboard está renderizado
  const dashboardElement = document.querySelector('.trainer-dashboard');
  console.log('¿Existe el elemento .trainer-dashboard?', !!dashboardElement);
  
  // Verificar si hay clientes en la lista
  const clientsList = document.querySelector('.clients-list');
  console.log('¿Existe el elemento .clients-list?', !!clientsList);
  
  if (clientsList) {
    const clientCards = clientsList.querySelectorAll('.client-card');
    console.log('Número de tarjetas de cliente encontradas:', clientCards.length);
    
    // Mostrar información de cada cliente
    if (clientCards.length > 0) {
      console.log('Información de clientes encontrados:');
      clientCards.forEach((card, index) => {
        const nameElement = card.querySelector('.client-name');
        const name = nameElement ? nameElement.textContent : 'Nombre no encontrado';
        console.log(`Cliente ${index + 1}: ${name}`);
      });
    } else {
      console.log('No se encontraron tarjetas de cliente. Verificando mensaje de "no hay clientes"');
      const noClientsMessage = clientsList.querySelector('.no-clients p');
      if (noClientsMessage) {
        console.log('Mensaje mostrado:', noClientsMessage.textContent);
      }
    }
  }
  
  // Verificar el estado global de React
  console.log('Intentando acceder al estado de React...');
  try {
    // Esta parte solo funcionará si las React DevTools están instaladas
    const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?._rendererInterfaces?.get(1);
    if (reactInstances) {
      console.log('React DevTools detectadas, puedes usar $r para inspeccionar componentes seleccionados');
    } else {
      console.log('React DevTools no detectadas o no accesibles');
    }
  } catch (e) {
    console.log('No se pudo acceder al estado de React:', e.message);
  }
  
  console.log('🔍 Fin de la depuración inicial');
}, 2000); // Esperar 2 segundos para que la página se cargue completamente