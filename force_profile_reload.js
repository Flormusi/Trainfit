// Script para forzar recarga completa del perfil y verificar datos

// Función para limpiar caché y recargar datos
async function forceProfileReload() {
  console.log('🔄 FORZANDO RECARGA COMPLETA DEL PERFIL...');
  
  // Limpiar localStorage relacionado con el perfil
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('profile') || key.includes('weight') || key.includes('dashboard'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('🗑️ Eliminando del localStorage:', key);
    localStorage.removeItem(key);
  });
  
  // Obtener token y clientId
  const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
  const clientId = localStorage.getItem('userId') || 'cmcxkgizo0002f5ljs8ubspxn';
  
  console.log('🔑 Token:', token ? 'Presente' : 'No encontrado');
  console.log('👤 Client ID:', clientId);
  
  if (!token) {
    console.error('❌ No se encontró token de autenticación');
    return;
  }
  
  try {
    // Hacer solicitud directa al backend con headers de no-cache
    console.log('\n📡 Solicitando datos frescos del perfil...');
    const response = await fetch(`http://localhost:5002/api/clients/${clientId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('❌ Error en la respuesta:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ DATOS FRESCOS DEL BACKEND:');
    console.log('📊 Respuesta completa:', JSON.stringify(data, null, 2));
    console.log('⚖️ Peso en el backend:', data.data?.weight);
    console.log('🎯 Frecuencia:', data.data?.trainingDaysPerWeek);
    console.log('📝 Objetivo:', data.data?.initialObjective);
    
    // Verificar si hay diferencia con lo que muestra la UI
    const weightElement = document.querySelector('[data-testid="current-weight"]') || 
                         document.querySelector('.weight-display') ||
                         Array.from(document.querySelectorAll('*')).find(el => 
                           el.textContent && el.textContent.includes('kg') && 
                           el.textContent.match(/\d+\s*kg/)
                         );
    
    if (weightElement) {
      console.log('\n🎨 PESO EN LA UI:', weightElement.textContent);
      console.log('🔍 Elemento encontrado:', weightElement);
    } else {
      console.log('\n⚠️ No se encontró elemento de peso en la UI');
    }
    
    // Forzar recarga de la página después de 2 segundos
    console.log('\n🔄 Recargando página en 2 segundos...');
    setTimeout(() => {
      window.location.reload(true);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error al obtener datos del perfil:', error);
  }
}

// Ejecutar la función
forceProfileReload();

console.log('\n🚀 Script de recarga forzada ejecutado. Revisa los logs arriba.');