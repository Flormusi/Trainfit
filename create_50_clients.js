const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api';

// Datos de ejemplo para generar clientes variados
const firstNames = [
  'Ana', 'Carlos', 'María', 'José', 'Laura', 'Miguel', 'Carmen', 'Antonio', 'Isabel', 'Francisco',
  'Pilar', 'Manuel', 'Rosa', 'David', 'Elena', 'Javier', 'Lucía', 'Rafael', 'Patricia', 'Sergio',
  'Cristina', 'Fernando', 'Beatriz', 'Alberto', 'Mónica', 'Roberto', 'Silvia', 'Andrés', 'Teresa', 'Diego',
  'Natalia', 'Alejandro', 'Raquel', 'Pablo', 'Irene', 'Rubén', 'Claudia', 'Adrián', 'Verónica', 'Iván',
  'Sonia', 'Óscar', 'Nuria', 'Víctor', 'Alicia', 'Gonzalo', 'Marta', 'Emilio', 'Rocío', 'Marcos'
];

const lastNames = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
  'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
  'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
  'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez'
];

const membershipTiers = ['basic', 'pro', 'premium'];
const genders = ['MALE', 'FEMALE'];
const fitnessLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const objectives = [
  'Perder peso', 'Ganar masa muscular', 'Mejorar resistencia', 'Tonificar', 'Rehabilitación',
  'Preparación deportiva', 'Mantenimiento', 'Flexibilidad', 'Fuerza funcional', 'Bienestar general'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomClient(index) {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@email.com`;
  const phone = `6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const weight = Math.floor(Math.random() * 50) + 50; // Entre 50 y 100 kg
  const trainingDaysPerWeek = Math.floor(Math.random() * 5) + 2; // Entre 2 y 6 días
  
  return {
    name,
    email,
    password: 'cliente123', // Password por defecto para todos los clientes
    phone,
    goals: [getRandomElement(objectives)],
    weight,
    initialObjective: getRandomElement(objectives),
    trainingDaysPerWeek,
    medicalConditions: Math.random() > 0.7 ? 'Ninguna condición médica relevante' : '',
    medications: Math.random() > 0.8 ? 'Ninguna medicación' : '',
    injuries: Math.random() > 0.9 ? 'Sin lesiones previas' : ''
  };
}

async function loginAndGetToken() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'trainer.test@trainfit.com',
      password: 'test123'
    });
    
    if (response.data && response.data.token) {
      console.log('✅ Login exitoso');
      return response.data.token;
    } else {
      throw new Error('No se recibió token en la respuesta');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function createClient(clientData, token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/clients/add-by-trainer`, clientData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error creando cliente ${clientData.name}:`, error.response?.data || error.message);
    return null;
  }
}

async function create50Clients() {
  try {
    console.log('🚀 Iniciando creación de 50 clientes...');
    
    // Login
    const token = await loginAndGetToken();
    
    let successCount = 0;
    let errorCount = 0;
    
    // Crear clientes en lotes para no sobrecargar el servidor
    const batchSize = 5;
    for (let i = 0; i < 50; i += batchSize) {
      const batch = [];
      
      for (let j = 0; j < batchSize && (i + j) < 50; j++) {
        const clientData = generateRandomClient(i + j + 1);
        batch.push(createClient(clientData, token));
      }
      
      console.log(`📦 Procesando lote ${Math.floor(i/batchSize) + 1}/10...`);
      const results = await Promise.all(batch);
      
      results.forEach((result, index) => {
        if (result) {
          successCount++;
          console.log(`✅ Cliente ${i + index + 1}/50 creado: ${result.data?.name || 'Nombre no disponible'}`);
        } else {
          errorCount++;
        }
      });
      
      // Pausa pequeña entre lotes para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Clientes creados exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📈 Total procesados: ${successCount + errorCount}/50`);
    
    if (successCount > 0) {
      console.log('\n🎯 ¡Ahora puedes probar el dashboard con múltiples clientes!');
      console.log('📱 Ve a: http://localhost:5173/trainer/clients');
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Ejecutar el script
create50Clients();