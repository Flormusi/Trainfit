// Script para probar el dashboard y verificar errores en consola
console.log('🔍 Iniciando prueba del dashboard...');

// Verificar si hay token en localStorage
const token = localStorage.getItem('token');
console.log('🔑 Token en localStorage:', token ? 'Presente' : 'Ausente');

// Verificar datos del usuario
const userData = localStorage.getItem('user');
console.log('👤 Datos del usuario:', userData ? JSON.parse(userData) : 'No encontrados');

// Verificar elementos del DOM
setTimeout(() => {
  console.log('🔍 Verificando elementos del DOM...');
  
  // Verificar sección de clientes
  const clientsSection = document.querySelector('.clients-section');
  console.log('📋 Sección de clientes:', clientsSection ? 'Encontrada' : 'No encontrada');
  
  // Verificar lista de clientes
  const clientsList = document.querySelector('.clients-list');
  console.log('📝 Lista de clientes:', clientsList ? 'Encontrada' : 'No encontrada');
  
  // Verificar tarjetas de clientes
  const clientCards = document.querySelectorAll('.client-card');
  console.log('👥 Tarjetas de clientes encontradas:', clientCards.length);
  
  if (clientCards.length > 0) {
    clientCards.forEach((card, index) => {
      const name = card.querySelector('.client-name')?.textContent;
      console.log(`👤 Cliente ${index + 1}:`, name);
    });
  }
  
  // Verificar mensaje de "no hay clientes"
  const noClients = document.querySelector('.no-clients');
  console.log('❌ Mensaje "no hay clientes":', noClients ? 'Visible' : 'No visible');
  
  // Verificar estadísticas
  const statsSection = document.querySelector('.stats-section');
  console.log('📊 Sección de estadísticas:', statsSection ? 'Encontrada' : 'No encontrada');
  
  // Verificar analíticas
  const analyticsSection = document.querySelector('.analytics-section');
  console.log('📈 Sección de analíticas:', analyticsSection ? 'Encontrada' : 'No encontrada');
  
}, 2000);

console.log('✅ Script de prueba ejecutado');