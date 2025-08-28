// Script simple para interceptar solicitudes PUT de actualización de perfil

console.log('🔍 Iniciando interceptor de red simple...');

// Interceptar fetch
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, options] = args;
  const method = options?.method || 'GET';
  
  // Solo logear solicitudes PUT a profile
  if (method === 'PUT' && url.includes('profile')) {
    console.log('\n🚨 SOLICITUD PUT DETECTADA:');
    console.log('URL:', url);
    console.log('Method:', method);
    console.log('Headers:', options?.headers);
    console.log('Body:', options?.body);
    
    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();
      const responseText = await clonedResponse.text();
      
      console.log('\n📥 RESPUESTA PUT:');
      console.log('Status:', response.status);
      console.log('Response:', responseText);
      
      return response;
    } catch (error) {
      console.error('\n❌ ERROR EN PUT:', error);
      throw error;
    }
  }
  
  // Para otras solicitudes, ejecutar normalmente
  return originalFetch.apply(this, args);
};

// Función para simular actualización manual
window.testProfileUpdate = async function() {
  console.log('\n🧪 Iniciando prueba manual de actualización...');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No hay token');
    return;
  }
  
  // Decodificar token para obtener userId
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.id;
  
  console.log('👤 User ID:', userId);
  
  const testData = {
    weight: 77.5,
    trainingDaysPerWeek: 5,
    initialObjective: 'Prueba manual de actualización'
  };
  
  console.log('📤 Enviando datos:', testData);
  
  try {
    const response = await fetch(`http://localhost:5002/api/clients/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('✅ Solicitud enviada, status:', response.status);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

console.log('✅ Interceptor configurado');
console.log('📋 Usa window.testProfileUpdate() para probar manualmente');

// Monitorear clics en botones de guardar
document.addEventListener('click', function(event) {
  const target = event.target;
  if (target.textContent && 
      (target.textContent.includes('Guardar') || 
       target.textContent.includes('guardar') ||
       target.textContent.includes('Actualizar'))) {
    console.log('\n🖱️ CLIC EN BOTÓN DE GUARDAR DETECTADO:', target);
    console.log('Texto del botón:', target.textContent);
    console.log('Clases:', target.className);
  }
});

console.log('👂 Escuchando clics en botones de guardar...');