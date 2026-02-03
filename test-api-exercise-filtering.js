const axios = require('axios');

// Configurar axios para usar la misma configuración que el frontend
axios.defaults.baseURL = 'http://localhost:5002/api';
axios.defaults.withCredentials = true;

(async () => {
  try {
    console.log('🚀 Iniciando prueba de filtrado de ejercicios por objetivo via API...');
    
    // Primero hacer login para obtener el token
    console.log('📝 Realizando login...');
    const loginResponse = await axios.post('/auth/login', {
      email: 'magagroca@gmail.com',
      password: 'magaroca'
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      console.log('✅ Login exitoso');
      
      // Configurar el token para las siguientes peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
      
      // Probar diferentes objetivos de entrenamiento
      const objectives = ['fuerza', 'hipertrofia', 'resistencia-cardio', 'potencia', 'quema-grasa'];
      
      for (const objective of objectives) {
        try {
          console.log(`\n🎯 Probando filtrado por objetivo: ${objective}`);
          
          // Hacer petición para obtener ejercicios filtrados por objetivo
          const exercisesResponse = await axios.get('/trainer/exercises', {
            params: { objective }
          });
          
          if (exercisesResponse.data.success && exercisesResponse.data.data) {
            const exercises = exercisesResponse.data.data.exercises || [];
            console.log(`✅ Se encontraron ${exercises.length} ejercicios para objetivo '${objective}'`);
            
            // Mostrar algunos ejercicios encontrados
            if (exercises.length > 0) {
              console.log('   Ejercicios encontrados:');
              for (let i = 0; i < Math.min(5, exercises.length); i++) {
                console.log(`   - ${exercises[i].name || exercises[i].id}`);
              }
            }
          } else {
            console.log(`⚠️  Respuesta inesperada para objetivo '${objective}':`, exercisesResponse.data);
          }
          
        } catch (error) {
          if (error.response) {
            console.log(`❌ Error ${error.response.status} para objetivo '${objective}': ${error.response.data.message || error.response.statusText}`);
          } else {
            console.log(`❌ Error de red para objetivo '${objective}': ${error.message}`);
          }
        }
      }
      
      // También probar sin filtro para comparar
      console.log('\n🔍 Probando obtener todos los ejercicios (sin filtro)...');
      try {
        const allExercisesResponse = await axios.get('/trainer/exercises');
        if (allExercisesResponse.data.success && allExercisesResponse.data.data) {
          const allExercises = allExercisesResponse.data.data.exercises || [];
          console.log(`✅ Total de ejercicios disponibles: ${allExercises.length}`);
        }
      } catch (error) {
        console.log('❌ Error obteniendo todos los ejercicios:', error.message);
      }
      
      console.log('\n🎉 Prueba de filtrado de ejercicios por API completada');
      
    } else {
      console.log('❌ Login falló:', loginResponse.data);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error de respuesta:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Error de petición:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
})();