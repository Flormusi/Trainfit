// Script para depurar específicamente el problema de los clientes en el dashboard
console.log('🔍 Iniciando depuración específica del dashboard...');

// Función para interceptar y analizar las llamadas a la API
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/trainer/clients')) {
    console.log('🌐 Interceptando llamada a /trainer/clients');
    return originalFetch.apply(this, args).then(response => {
      const clonedResponse = response.clone();
      clonedResponse.json().then(data => {
        console.log('📦 Respuesta completa de /trainer/clients:', data);
        console.log('📊 Estructura de la respuesta:');
        console.log('- data:', data);
        console.log('- data.data:', data.data);
        console.log('- data.data.clients:', data.data?.clients);
        
        if (data.data && data.data.clients) {
          console.log('✅ Clientes encontrados:', data.data.clients.length);
          data.data.clients.forEach((client, index) => {
            console.log(`👤 Cliente ${index + 1}:`, {
              id: client.id,
              name: client.name,
              email: client.email,
              clientProfile: client.clientProfile
            });
          });
          
          // Verificar específicamente el cliente de Florencia
          const florenciaClient = data.data.clients.find(c => c.email === 'florenciamusitani@gmail.com');
          if (florenciaClient) {
            console.log('🎯 Cliente Florencia encontrado en la respuesta:', florenciaClient);
          } else {
            console.log('❌ Cliente Florencia NO encontrado en la respuesta');
          }
        }
      }).catch(e => console.error('❌ Error al parsear respuesta:', e));
      
      return response;
    });
  }
  return originalFetch.apply(this, args);
};

// Función para verificar el estado de React
function checkReactState() {
  console.log('⚛️ Verificando estado de React...');
  
  // Buscar elementos del DOM relacionados con clientes
  const clientsSection = document.querySelector('.clients-section');
  const clientsList = document.querySelector('.clients-list');
  const clientCards = document.querySelectorAll('.client-card');
  const noClientsMessage = document.querySelector('.no-clients');
  
  console.log('🔍 Elementos del DOM encontrados:');
  console.log('- Sección de clientes:', !!clientsSection);
  console.log('- Lista de clientes:', !!clientsList);
  console.log('- Tarjetas de cliente:', clientCards.length);
  console.log('- Mensaje "no hay clientes":', !!noClientsMessage);
  
  if (clientCards.length > 0) {
    console.log('🃏 Detalles de las tarjetas de cliente:');
    clientCards.forEach((card, index) => {
      const name = card.querySelector('.client-name')?.textContent;
      const goal = card.querySelector('.client-goal')?.textContent;
      console.log(`Tarjeta ${index + 1}: ${name} - ${goal}`);
    });
  }
  
  if (noClientsMessage) {
    console.log('📝 Mensaje mostrado:', noClientsMessage.textContent);
  }
  
  return {
    clientsSection: !!clientsSection,
    clientsList: !!clientsList,
    clientCards: clientCards.length,
    noClientsMessage: !!noClientsMessage
  };
}

// Ejecutar verificación inicial después de 3 segundos
setTimeout(() => {
  console.log('🚀 Ejecutando verificación inicial...');
  checkReactState();
}, 3000);

// Verificar cada 5 segundos
setInterval(() => {
  const status = checkReactState();
  if (status.clientCards > 0) {
    console.log('✅ Clientes detectados en el DOM');
  } else if (status.noClientsMessage) {
    console.log('⚠️ Mostrando mensaje "no hay clientes"');
  }
}, 5000);

console.log('✅ Script de depuración específica cargado y monitoreando...');