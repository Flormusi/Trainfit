// Script simple para verificar el estado actual del dashboard
console.log('🔍 Verificando estado actual del dashboard...');

// Verificar si hay elementos de clientes en el DOM
const clientCards = document.querySelectorAll('.client-card');
const noClientsMessage = document.querySelector('.no-clients');
const clientsSection = document.querySelector('.clients-section');

console.log('📊 Estado del DOM:');
console.log('- Tarjetas de cliente encontradas:', clientCards.length);
console.log('- Mensaje "no hay clientes":', !!noClientsMessage);
console.log('- Sección de clientes:', !!clientsSection);

if (clientCards.length > 0) {
  console.log('✅ Clientes encontrados en el DOM:');
  clientCards.forEach((card, index) => {
    const name = card.querySelector('.client-name')?.textContent;
    const goal = card.querySelector('.client-goal')?.textContent;
    console.log(`  ${index + 1}. ${name} - ${goal}`);
  });
} else if (noClientsMessage) {
  console.log('⚠️ Mostrando mensaje:', noClientsMessage.textContent);
} else {
  console.log('❓ Estado desconocido - no se encontraron clientes ni mensaje');
}

// Verificar si hay errores en la consola
console.log('🔍 Verificación completada. Revisa los logs anteriores para más detalles.');