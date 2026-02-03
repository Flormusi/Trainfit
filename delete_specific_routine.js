const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

// Función para hacer login
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'trainer.test@trainfit.com',
      password: 'test123'
    });
    
    if (response.data.token) {
      console.log('✅ Login exitoso');
      return response.data.token;
    } else {
      throw new Error('No se recibió token');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Función para obtener rutinas
async function getRoutines(token) {
  try {
    const response = await axios.get(`${BASE_URL}/trainer/routines`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📋 Se encontraron ${response.data.length} rutinas`);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo rutinas:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Función para eliminar rutina específica
async function deleteSpecificRoutine(token, routineName) {
  try {
    // Primero obtener todas las rutinas
    const routines = await getRoutines(token);
    
    // Buscar la rutina específica
    const targetRoutine = routines.find(routine => 
      routine.name && routine.name.includes(routineName)
    );
    
    if (!targetRoutine) {
      console.log(`❌ No se encontró la rutina que contenga: "${routineName}"`);
      console.log('Rutinas disponibles:');
      routines.forEach(routine => {
        console.log(`  - ${routine.name} (ID: ${routine.id})`);
      });
      return false;
    }
    
    console.log(`🎯 Rutina encontrada: "${targetRoutine.name}" (ID: ${targetRoutine.id})`);
    
    // Eliminar la rutina
    const deleteResponse = await axios.delete(`${BASE_URL}/trainer/routines/${targetRoutine.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.status === 204) {
      console.log(`✅ Rutina "${targetRoutine.name}" eliminada exitosamente`);
      return true;
    } else {
      console.log(`❌ Error eliminando rutina. Status: ${deleteResponse.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error eliminando rutina:', error.response?.data?.message || error.message);
    return false;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando eliminación de rutina específica...');
    
    // Login
    const token = await login();
    
    // Eliminar la rutina específica
    const success = await deleteSpecificRoutine(token, 'Rutina de Prueba - Reenvío Email');
    
    if (success) {
      console.log('🎉 Proceso completado exitosamente');
    } else {
      console.log('❌ No se pudo completar la eliminación');
    }
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  }
}

// Ejecutar el script
main();