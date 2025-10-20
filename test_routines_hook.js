// Script para probar el hook useClientRoutines
const API_BASE_URL = 'http://localhost:5002/api';

async function testRoutinesHook() {
    console.log('🧪 Iniciando prueba del hook useClientRoutines...');
    
    // Obtener token del localStorage (simular lo que hace el hook)
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ No hay token en localStorage');
        return;
    }
    
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    
    try {
        // Decodificar token para ver el rol
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('👤 Payload del token:', payload);
        console.log('🎭 Rol del usuario:', payload.role);
        
        // Probar petición a trainer API
        console.log('\n📡 Probando petición a /trainer/routines...');
        const trainerResponse = await fetch(`${API_BASE_URL}/trainer/routines`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status de trainer API:', trainerResponse.status);
        
        if (trainerResponse.ok) {
            const trainerData = await trainerResponse.json();
            console.log('✅ Trainer API exitosa:', trainerData);
            console.log('📋 Cantidad de rutinas:', trainerData.length);
        } else {
            const errorText = await trainerResponse.text();
            console.log('❌ Trainer API falló:', errorText);
            
            // Probar petición a client API como fallback
            console.log('\n📡 Probando petición a /clients/profile/routines...');
            const clientResponse = await fetch(`${API_BASE_URL}/clients/profile/routines`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📊 Status de client API:', clientResponse.status);
            
            if (clientResponse.ok) {
                const clientData = await clientResponse.json();
                console.log('✅ Client API exitosa:', clientData);
            } else {
                const clientErrorText = await clientResponse.text();
                console.log('❌ Client API también falló:', clientErrorText);
            }
        }
        
    } catch (error) {
        console.error('💥 Error en la prueba:', error);
    }
}

// Ejecutar la prueba
testRoutinesHook();