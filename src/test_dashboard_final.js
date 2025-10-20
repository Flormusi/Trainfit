// Script para probar el dashboard final
console.log('🔍 PRUEBA FINAL DEL DASHBOARD');

// 1. Verificar que estamos en la página correcta
console.log('📍 URL actual:', window.location.href);

// 2. Verificar token en localStorage
const token = localStorage.getItem('token');
console.log('🔑 Token presente:', !!token);
if (token) {
  console.log('🔑 Token (primeros 50 chars):', token.substring(0, 50) + '...');
}

// 3. Verificar datos del usuario
const userData = localStorage.getItem('user');
console.log('👤 Datos del usuario:', userData ? JSON.parse(userData) : 'No encontrados');

// 4. Hacer petición directa a la API de clientes
async function testClientsAPI() {
  try {
    console.log('🔄 Probando API de clientes...');
    
    const response = await fetch('http://localhost:5002/api/trainer/clients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status de respuesta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta de la API:', data);
      
      if (data.success && data.data && data.data.clients) {
        console.log('✅ Clientes encontrados:', data.data.clients.length);
        data.data.clients.forEach((client, index) => {
          console.log(`👤 Cliente ${index + 1}:`, client.name, '(' + client.email + ')');
        });
      } else {
        console.log('❌ Estructura de respuesta inesperada');
      }
    } else {
      console.log('❌ Error en la respuesta:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Error al probar API:', error);
  }
}

// 5. Verificar elementos del DOM
function checkDOMElements() {
  console.log('🔍 Verificando elementos del DOM...');
  
  const clientsSection = document.querySelector('.clients-section');
  console.log('📋 Sección de clientes encontrada:', !!clientsSection);
  
  const clientCards = document.querySelectorAll('.client-card');
  console.log('👥 Tarjetas de clientes encontradas:', clientCards.length);
  
  if (clientCards.length > 0) {
    clientCards.forEach((card, index) => {
      const name = card.querySelector('.client-name')?.textContent;
      console.log(`👤 Cliente ${index + 1} en DOM:`, name);
    });
  }
  
  const loadingSpinner = document.querySelector('.loading-spinner');
  console.log('⏳ Spinner de carga visible:', !!loadingSpinner);
}

// Ejecutar pruebas
testClientsAPI();
setTimeout(checkDOMElements, 2000); // Esperar 2 segundos para que cargue el DOM

console.log('✅ Script de prueba ejecutado. Revisa los logs arriba.');