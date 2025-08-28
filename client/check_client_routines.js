// Script para verificar las rutinas del cliente específico
const CLIENT_ID = 'cmcxkgizo0002f5ljs8ubspxn';
const API_BASE_URL = 'http://localhost:5002/api';

async function checkClientRoutines() {
    console.log('🔍 Verificando rutinas del cliente:', CLIENT_ID);
    
    try {
        // 1. Verificar conectividad del backend
        console.log('\n1. Verificando conectividad del backend...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (healthResponse.ok) {
            console.log('✅ Backend conectado correctamente');
        } else {
            console.log('❌ Backend no responde');
            return;
        }

        // 2. Obtener token del localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No hay token en localStorage. Ejecuta el script de login primero.');
            return;
        }
        console.log('✅ Token encontrado en localStorage');

        // 3. Verificar datos del cliente
        console.log('\n2. Obteniendo datos del cliente...');
        const clientResponse = await fetch(`${API_BASE_URL}/clients/${CLIENT_ID}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!clientResponse.ok) {
            console.log('❌ Error al obtener datos del cliente:', clientResponse.status);
            const errorText = await clientResponse.text();
            console.log('Error details:', errorText);
            return;
        }

        const clientData = await clientResponse.json();
        console.log('✅ Datos del cliente obtenidos:');
        console.log('- Nombre:', clientData.name);
        console.log('- Email:', clientData.email);
        console.log('- ID:', clientData.id);

        // 4. Verificar rutinas del cliente
        console.log('\n3. Verificando rutinas asignadas...');
        
        // Buscar rutinas en los datos del cliente
        if (clientData.routines && clientData.routines.length > 0) {
            console.log('✅ Rutinas encontradas en datos del cliente:');
            clientData.routines.forEach((routine, index) => {
                console.log(`- Rutina ${index + 1}:`, routine.name || routine.title || 'Sin nombre');
                console.log(`  ID: ${routine.id}`);
                console.log(`  Descripción: ${routine.description || 'Sin descripción'}`);
            });
        } else {
            console.log('⚠️ No se encontraron rutinas en los datos del cliente');
        }

        // 5. Buscar rutinas directamente en la API (ruta de trainer)
        console.log('\n4. Buscando rutinas directamente en la API...');
        const routinesResponse = await fetch(`${API_BASE_URL}/trainer/clients/${CLIENT_ID}/routines`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (routinesResponse.ok) {
            const routinesData = await routinesResponse.json();
            console.log('✅ Respuesta de rutinas desde API:');
            console.log(routinesData);
            
            if (routinesData.length > 0) {
                console.log(`📋 Se encontraron ${routinesData.length} rutina(s):`);
                routinesData.forEach((routine, index) => {
                    console.log(`- Rutina ${index + 1}:`, routine.name || routine.title);
                    console.log(`  ID: ${routine.id}`);
                    console.log(`  Ejercicios: ${routine.exercises ? routine.exercises.length : 'No definidos'}`);
                });
            } else {
                console.log('⚠️ No hay rutinas asignadas a este cliente');
            }
        } else {
            console.log('❌ Error al obtener rutinas:', routinesResponse.status);
            const errorText = await routinesResponse.text();
            console.log('Error details:', errorText);
        }

        // 6. Verificar todas las rutinas del sistema
        console.log('\n5. Verificando todas las rutinas del sistema...');
        const allRoutinesResponse = await fetch(`${API_BASE_URL}/trainer/routines`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (allRoutinesResponse.ok) {
            const allRoutines = await allRoutinesResponse.json();
            console.log(`📚 Total de rutinas en el sistema: ${allRoutines.length}`);
            
            // Filtrar rutinas que pertenecen a este cliente
            const clientRoutines = allRoutines.filter(routine => 
                routine.clientId === CLIENT_ID || 
                routine.assignedTo === CLIENT_ID ||
                (routine.client && routine.client.id === CLIENT_ID)
            );
            
            if (clientRoutines.length > 0) {
                console.log(`✅ Rutinas asignadas a este cliente: ${clientRoutines.length}`);
                clientRoutines.forEach((routine, index) => {
                    console.log(`- ${routine.name || routine.title}`);
                    console.log(`  ID: ${routine.id}`);
                    console.log(`  Estado: ${routine.status || 'Activa'}`);
                });
            } else {
                console.log('⚠️ No se encontraron rutinas asignadas a este cliente en el sistema');
            }
        } else {
            console.log('❌ Error al obtener todas las rutinas:', allRoutinesResponse.status);
        }

        console.log('\n🔍 Verificación completada');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    }
}

// Ejecutar la verificación
checkClientRoutines();