// Script para probar la generación de plantillas por objetivo
console.log('🧪 PRUEBA DE GENERACIÓN DE PLANTILLAS POR OBJETIVO');

const API_BASE_URL = 'http://localhost:5002/api';

// Función para hacer login y obtener token
async function loginAndGetToken() {
  console.log('\n🔐 Haciendo login...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'magagroca@gmail.com',
        password: 'magaroca'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      console.log('✅ Login exitoso');
      console.log('👤 Usuario:', data.user.name);
      return data.token;
    } else {
      console.error('❌ Error en login:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión en login:', error);
    return null;
  }
}

// Función para probar la generación de plantillas
async function testTemplateGeneration(token) {
  console.log('\n🏋️ Probando generación de plantillas...');
  
  const testCases = [
    {
      name: 'Hipertrofia - 3 días - Intermedio',
      params: {
        objetivo: 'hipertrofia',
        dias: 3,
        nivel: 'intermedio',
        genero: 'unisex'
      }
    },
    {
      name: 'Fuerza - 2 días - Avanzado',
      params: {
        objetivo: 'fuerza',
        dias: 2,
        nivel: 'avanzado',
        genero: 'masculino'
      }
    },
    {
      name: 'Quema grasa - 3 días - Principiante',
      params: {
        objetivo: 'quema-grasa',
        dias: 3,
        nivel: 'principiante',
        genero: 'femenino'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Probando: ${testCase.name}`);
    console.log('📊 Parámetros:', JSON.stringify(testCase.params, null, 2));
    
    try {
      const response = await fetch(`${API_BASE_URL}/routines/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testCase.params)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Plantilla generada exitosamente');
        console.log('📈 Estadísticas:');
        console.log(`   - Total ejercicios: ${data.data.stats.totalExercises}`);
        console.log(`   - Movilidad: ${data.data.stats.exercisesByCategory.movilidad}`);
        console.log(`   - Principal: ${data.data.stats.exercisesByCategory.principal}`);
        console.log(`   - Finisher: ${data.data.stats.exercisesByCategory.finisher}`);
        console.log(`   - Grupos musculares: ${data.data.stats.muscleGroups.length}`);
        
        console.log('\n📅 Días generados:');
        data.data.template.days.forEach(day => {
          console.log(`   ${day.name}: ${day.exercises.length} ejercicios`);
          if (day.error) {
            console.log(`   ⚠️  ${day.error}`);
          }
          
          // Mostrar algunos ejercicios de ejemplo
          const sampleExercises = day.exercises.slice(0, 3);
          sampleExercises.forEach(exercise => {
            console.log(`      - ${exercise.name} (${exercise.sets}x${exercise.reps})`);
          });
          if (day.exercises.length > 3) {
            console.log(`      ... y ${day.exercises.length - 3} más`);
          }
        });
        
      } else {
        console.error('❌ Error generando plantilla:', data.message);
      }
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
    }
    
    // Pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Función para probar validaciones
async function testValidations(token) {
  console.log('\n🔍 Probando validaciones...');
  
  const invalidCases = [
    {
      name: 'Sin parámetros requeridos',
      params: {}
    },
    {
      name: 'Objetivo inválido',
      params: {
        objetivo: 'objetivo-inexistente',
        dias: 3,
        nivel: 'intermedio'
      }
    },
    {
      name: 'Días inválidos',
      params: {
        objetivo: 'hipertrofia',
        dias: 5,
        nivel: 'intermedio'
      }
    },
    {
      name: 'Nivel inválido',
      params: {
        objetivo: 'hipertrofia',
        dias: 3,
        nivel: 'experto'
      }
    }
  ];
  
  for (const testCase of invalidCases) {
    console.log(`\n❌ Probando: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/routines/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testCase.params)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.log('✅ Validación funcionando:', data.message);
      } else {
        console.log('⚠️  Se esperaba error pero la respuesta fue exitosa');
      }
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
    }
  }
}

// Función principal
async function runTests() {
  console.log('🚀 Iniciando pruebas del endpoint de plantillas...');
  console.log('🔗 URL del API:', API_BASE_URL);
  
  // Verificar que el backend esté funcionando
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend funcionando correctamente');
    } else {
      console.error('❌ Backend no responde correctamente');
      return;
    }
  } catch (error) {
    console.error('❌ No se puede conectar al backend:', error.message);
    console.log('💡 Asegúrate de que el backend esté ejecutándose en puerto 5002');
    return;
  }
  
  // Hacer login
  const token = await loginAndGetToken();
  if (!token) {
    console.error('❌ No se pudo obtener token de autenticación');
    return;
  }
  
  // Probar generación de plantillas
  await testTemplateGeneration(token);
  
  // Probar validaciones
  await testValidations(token);
  
  console.log('\n🎉 Pruebas completadas');
  console.log('\n💡 Notas:');
  console.log('   - Si ves ejercicios "fallback", significa que la base de datos tiene pocos ejercicios');
  console.log('   - Los ejercicios de respaldo son normales durante el desarrollo');
  console.log('   - Para mejorar los resultados, agrega más ejercicios a la base de datos');
}

// Ejecutar las pruebas
runTests().catch(console.error);