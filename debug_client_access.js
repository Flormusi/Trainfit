// Script para debuggear el acceso al cliente en el navegador
// Ejecutar en la consola del navegador

console.log('🔍 Debuggeando acceso al cliente...');

// 1. Verificar token en localStorage
const token = localStorage.getItem('token');
console.log('Token en localStorage:', token ? 'Existe' : 'No existe');

// 2. Verificar si estamos autenticados
const authData = localStorage.getItem('authData');
console.log('AuthData:', authData ? JSON.parse(authData) : 'No existe');

// 3. Probar la API directamente
async function testClientAPI() {
    try {
        const clientId = 'cmcxkgizo0002f5ljs8ubspxn';
        const response = await fetch(`http://localhost:5003/api/trainer/clients/${clientId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Status de la respuesta:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos del cliente obtenidos:', data);
            return data;
        } else {
            const error = await response.text();
            console.error('❌ Error en la API:', error);
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}

// 4. Ejecutar test
testClientAPI();

// 5. Función para forzar recarga del componente
function forceReload() {
    console.log('🔄 Forzando recarga...');
    window.location.reload();
}

console.log('📝 Comandos disponibles:');
console.log('- testClientAPI() - Probar API del cliente');
console.log('- forceReload() - Forzar recarga de la página');