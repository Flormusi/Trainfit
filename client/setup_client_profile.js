const axios = require('axios');

// Configurar axios para usar el backend correcto
axios.defaults.baseURL = 'http://localhost:5002/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

async function setupClientProfile() {
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
    
    // 4. Actualizar el perfil del cliente con datos de ejemplo
    console.log('👤 Actualizando perfil del cliente...');
    
    const profileData = {
      weight: 70,
      initialObjective: 'Ganar masa muscular y mejorar fuerza general',
      trainingDaysPerWeek: 4,
      goals: ['Ganar masa muscular', 'Mejorar fuerza'],
      age: 28,
      gender: 'FEMALE',
      fitnessLevel: 'INTERMEDIATE',
      height: 165,
      phone: '+54 9 11 1234-5678'
    };
    
    const updateResponse = await axios.put(`/trainer/clients/${clientId}`, profileData);
    console.log('✅ Perfil del cliente actualizado exitosamente!');
    console.log('📊 Datos configurados:');
    console.log(`   - Peso: ${profileData.weight} kg`);
    console.log(`   - Objetivo: ${profileData.initialObjective}`);
    console.log(`   - Días de entrenamiento: ${profileData.trainingDaysPerWeek} días/semana`);
    console.log(`   - Objetivos: ${profileData.goals.join(', ')}`);
    
    // 5. Verificar que los datos se guardaron correctamente
    console.log('🔍 Verificando datos del perfil...');
    const profileResponse = await axios.get(`/trainer/clients/${clientId}`);
    const profile = profileResponse.data.data;
    
    console.log('✅ Perfil verificado:');
    console.log(`   - Peso: ${profile.clientProfile?.weight || 'No definido'} kg`);
    console.log(`   - Objetivo inicial: ${profile.clientProfile?.initialObjective || 'No definido'}`);
    console.log(`   - Días de entrenamiento: ${profile.clientProfile?.trainingDaysPerWeek || 'No definido'} días/semana`);
    
    console.log('🎉 ¡Perfil del cliente configurado exitosamente!');
    console.log('🔗 Ahora puedes ver las métricas en: http://localhost:5173/client/dashboard');
    
  } catch (error) {
    console.error('❌ Error configurando perfil del cliente:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 Error de autenticación - verificar credenciales');
    } else if (error.response?.status === 403) {
      console.log('🚫 Error de permisos - verificar roles de usuario');
    } else if (error.response?.status === 404) {
      console.log('🔍 Cliente no encontrado - verificar ID del cliente');
    }
  }
}

setupClientProfile();