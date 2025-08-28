// Script para verificar los datos del perfil directamente desde el backend

// Función para obtener el token de autenticación
function getAuthToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  return null;
}

// Función para obtener el ID del cliente desde localStorage
function getClientId() {
  return localStorage.getItem('userId') || 'cmcxkgizo0002f5ljs8ubspxn';
}

// Función principal para verificar los datos del perfil
async function checkProfileData() {
  const token = getAuthToken();
  const clientId = getClientId();
  
  console.log('🔍 Verificando datos del perfil del cliente...');
  console.log('Token:', token ? 'Presente' : 'No encontrado');
  console.log('Client ID:', clientId);
  
  if (!token) {
    console.error('❌ No se encontró token de autenticación');
    return;
  }
  
  try {
    // Solicitar datos del perfil
    console.log('\n📡 Solicitando datos del perfil...');
    const profileResponse = await fetch(`http://localhost:5002/api/clients/${clientId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!profileResponse.ok) {
      console.error('❌ Error en la respuesta del perfil:', profileResponse.status, profileResponse.statusText);
      return;
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Datos del perfil recibidos:');
    console.log('📊 Perfil completo:', JSON.stringify(profileData, null, 2));
    console.log('⚖️ Peso actual en el backend:', profileData.data?.weight);
    
    // También verificar datos de progreso
    console.log('\n📡 Solicitando datos de progreso...');
    const progressResponse = await fetch(`http://localhost:5002/api/clients/${clientId}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (progressResponse.ok) {
      const progressData = await progressResponse.json();
      console.log('✅ Datos de progreso recibidos:');
      console.log('📈 Progreso completo:', JSON.stringify(progressData, null, 2));
    } else {
      console.log('⚠️ No se pudieron obtener datos de progreso:', progressResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error al verificar datos del perfil:', error);
  }
}

// Ejecutar la verificación
checkProfileData();

console.log('\n🔄 Script de verificación de perfil ejecutado. Revisa los logs arriba.');