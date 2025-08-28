// Script completo: Login + Verificación de rutinas del cliente
const CLIENT_ID = 'cmcxkgizo0002f5ljs8ubspxn';
const API_BASE_URL = 'http://localhost:5002/api';

async function loginAndCheckRoutines() {
    console.log('🔐 Iniciando sesión y verificando rutinas...');
    
    try {
        // 1. Login
        console.log('\n1. Iniciando sesión...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'trainer@example.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            console.log('❌ Error en login:', loginResponse.status);
            const errorText = await loginResponse.text();
            console.log('Error details:', errorText);
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
        console.log('✅ Login exitoso');
        console.log('- Usuario:', loginData.user.name);
        console.log('- Rol:', loginData.user.role);
        console.log('- Token guardado en localStorage');

        // 2. Verificar conectividad del backend
        console.log('\n2. Verificando conectividad del backend...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (healthResponse.ok) {
            console.log('✅ Backend conectado correctamente');
        } else {
            console.log('❌ Backend no responde');
            return;
        }

        // 3. Verificar datos del cliente
        console.log('\n3. Obteniendo datos del cliente...');
        const clientResponse = await fetch(`${API_BASE_URL}/trainer/clients/${CLIENT_ID}`, {
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

        // 4. Verificar rutinas del cliente específico
        console.log('\n4. Verificando rutinas asignadas al cliente...');
        const routinesResponse = await fetch(`${API_BASE_URL}/trainer/clients/${CLIENT_ID}/routines`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (routinesResponse.ok) {
            const routinesData = await routinesResponse.json();
            console.log('✅ Respuesta de rutinas desde API:');
            console.log('Estructura de respuesta:', Object.keys(routinesData));
            
            // La respuesta viene en routinesData.data
            const routines = routinesData.data || routinesData;
            
            if (routines && routines.length > 0) {
                console.log(`📋 Se encontraron ${routines.length} rutina(s):`);
                routines.forEach((routine, index) => {
                    console.log(`\n- Rutina ${index + 1}:`);
                    console.log(`  Nombre: ${routine.name || routine.title || 'Sin nombre'}`);
                    console.log(`  ID: ${routine.id}`);
                    console.log(`  Descripción: ${routine.description || 'Sin descripción'}`);
                    console.log(`  Ejercicios: ${routine.exercises ? routine.exercises.length : 'No definidos'}`);
                    console.log(`  Fecha asignación: ${routine.assignedDate || 'No definida'}`);
                    console.log(`  Fecha inicio: ${routine.startDate || 'No definida'}`);
                    console.log(`  Fecha fin: ${routine.endDate || 'No definida'}`);
                    
                    if (routine.exercises && routine.exercises.length > 0) {
                        console.log(`  Lista de ejercicios:`);
                        routine.exercises.forEach((exercise, exIndex) => {
                            console.log(`    ${exIndex + 1}. ${exercise.name || exercise.title || 'Ejercicio sin nombre'}`);
                        });
                    }
                });
            } else {
                console.log('⚠️ No hay rutinas asignadas a este cliente');
                console.log('Respuesta completa:', routinesData);
            }
        } else {
            console.log('❌ Error al obtener rutinas:', routinesResponse.status);
            const errorText = await routinesResponse.text();
            console.log('Error details:', errorText);
        }

        // 5. Verificar todas las rutinas del trainer
        console.log('\n5. Verificando todas las rutinas del trainer...');
        const allRoutinesResponse = await fetch(`${API_BASE_URL}/trainer/routines`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (allRoutinesResponse.ok) {
            const allRoutines = await allRoutinesResponse.json();
            const routinesList = allRoutines.data || allRoutines;
            console.log(`📚 Total de rutinas del trainer: ${routinesList.length}`);
            
            // Filtrar rutinas que pertenecen a este cliente
            const clientRoutines = routinesList.filter(routine => 
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
                
                // Mostrar todas las rutinas para debug
                console.log('\n🔍 Debug - Todas las rutinas del trainer:');
                routinesList.forEach((routine, index) => {
                    console.log(`${index + 1}. ${routine.name || routine.title}`);
                    console.log(`   ID: ${routine.id}`);
                    console.log(`   Cliente ID: ${routine.clientId || 'No asignado'}`);
                    console.log(`   Cliente: ${routine.client ? routine.client.name : 'No definido'}`);
                });
            }
        } else {
            console.log('❌ Error al obtener todas las rutinas:', allRoutinesResponse.status);
        }

        // 6. Verificar asignaciones de rutinas
        console.log('\n6. Verificando asignaciones de rutinas...');
        const assignmentsResponse = await fetch(`${API_BASE_URL}/trainer/routines/assignments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (assignmentsResponse.ok) {
            const assignments = await assignmentsResponse.json();
            console.log('📋 Asignaciones de rutinas:', assignments);
            
            // Filtrar asignaciones para este cliente
            const clientAssignments = assignments.filter(assignment => 
                assignment.clientId === CLIENT_ID
            );
            
            if (clientAssignments.length > 0) {
                console.log(`✅ Asignaciones encontradas para este cliente: ${clientAssignments.length}`);
                clientAssignments.forEach((assignment, index) => {
                    console.log(`- Asignación ${index + 1}:`);
                    console.log(`  Rutina: ${assignment.routine ? assignment.routine.name : 'No definida'}`);
                    console.log(`  Fecha asignación: ${assignment.assignedDate}`);
                    console.log(`  Fecha inicio: ${assignment.startDate}`);
                    console.log(`  Fecha fin: ${assignment.endDate}`);
                });
            } else {
                console.log('⚠️ No se encontraron asignaciones para este cliente');
            }
        } else {
            console.log('❌ Error al obtener asignaciones:', assignmentsResponse.status);
        }

        console.log('\n🔍 Verificación completada');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    }
}

// Ejecutar la verificación
loginAndCheckRoutines();