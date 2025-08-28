const axios = require('axios');

// Configurar axios para usar el backend correcto
axios.defaults.baseURL = 'http://localhost:5002/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

async function setupTestData() {
  try {
    console.log('🔐 Iniciando sesión como entrenador...');
    
    // 1. Login como entrenador
    const trainerLoginResponse = await axios.post('/auth/login', {
      email: 'test@trainfit.com',
      password: 'test123'
    });
    
    const trainerToken = trainerLoginResponse.data.token;
    console.log('✅ Login de entrenador exitoso');
    
    // 2. Login como cliente para obtener su ID
    console.log('🔐 Iniciando sesión como cliente...');
    const clientLoginResponse = await axios.post('/auth/login', {
      email: 'client@trainfit.com',
      password: 'test123'
    });
    
    const clientData = clientLoginResponse.data.user;
    const clientId = clientData.id;
    console.log(`✅ Cliente encontrado: ${clientId}`);
    
    // 3. Configurar axios con el token del entrenador
    axios.defaults.headers.common['Authorization'] = `Bearer ${trainerToken}`;
    
    // 4. Crear una rutina de prueba para el cliente
    console.log('🏋️ Creando rutina de prueba...');
    
    const routineData = {
      name: 'Rutina de Prueba - Fuerza',
      clientId: clientId,
      duration: '4 semanas',
      notes: 'Rutina de prueba para verificar el botón de editar',
      exercises: [
        {
          id: 'exercise_1',
          exerciseId: 'sentadillas_1',
          name: 'Sentadillas',
          series: '3',
          reps: '12',
          weight: '60',
          notes: 'Mantener la espalda recta',
          day: 1
        },
        {
          id: 'exercise_2',
          exerciseId: 'press_banca_1',
          name: 'Press de Banca',
          series: '3',
          reps: '10',
          weight: '70',
          notes: 'Controlar la bajada',
          day: 1
        }
      ]
    };
    
    const createRoutineResponse = await axios.post('/trainer/routines', routineData);
    console.log('Respuesta completa de creación:', JSON.stringify(createRoutineResponse.data, null, 2));
    
    const routineId = createRoutineResponse.data.data?.routine?.id || 
                     createRoutineResponse.data.data?.id || 
                     createRoutineResponse.data.id || 
                     createRoutineResponse.data.routine?.id;
    
    if (!routineId) {
      console.log('❌ No se pudo obtener el ID de la rutina creada');
      console.log('📋 Respuesta completa:', JSON.stringify(createRoutineResponse.data, null, 2));
      return;
    }
    
    console.log('✅ Rutina creada exitosamente!');
    console.log(`   - ID de rutina: ${routineId}`);
    console.log(`   - Cliente ID: ${clientId}`);
    
    // 5. Verificar que la rutina se puede obtener
    console.log('📝 Verificando que la rutina se puede obtener...');
    const routineDetailsResponse = await axios.get(`/trainer/routines/${routineId}`);
    const routineDetails = routineDetailsResponse.data;
    
    console.log('✅ Rutina obtenida exitosamente:');
    console.log(`   - Nombre: ${routineDetails.name}`);
    console.log(`   - Ejercicios: ${routineDetails.exercises?.length || 0}`);
    
    console.log('🎉 ¡Datos de prueba configurados exitosamente!');
    console.log(`🔗 URL para probar el botón de editar: http://localhost:5173/trainer/routines/${routineId}/edit`);
    console.log(`🔗 URL de detalles del cliente: http://localhost:5173/trainer/clients/${clientId}`);
    
  } catch (error) {
    console.error('❌ Error configurando datos de prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 Error de autenticación - verificar credenciales');
    } else if (error.response?.status === 403) {
      console.log('🚫 Error de permisos - verificar roles de usuario');
    } else if (error.response?.status === 404) {
      console.log('🔍 Recurso no encontrado - verificar endpoints');
    }
  }
}

setupTestData();