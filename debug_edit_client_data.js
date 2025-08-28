// Script para depurar los datos del cliente en EditClientPage
console.log('🔍 Iniciando depuración de datos del cliente...');

// Función para verificar los datos del cliente
async function debugClientData() {
    try {
        // Obtener el clientId de la URL
        const url = window.location.pathname;
        const clientIdMatch = url.match(/\/trainer\/clients\/([^\/]+)\/edit/);
        
        if (!clientIdMatch) {
            console.error('❌ No se pudo extraer clientId de la URL:', url);
            return;
        }
        
        const clientId = clientIdMatch[1];
        console.log('📋 Client ID extraído:', clientId);
        
        // Obtener el token
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No hay token en localStorage');
            return;
        }
        console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
        
        // Hacer la petición al API
        const apiUrl = `http://localhost:5002/api/trainer/clients/${clientId}`;
        console.log('🌐 Haciendo petición a:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Status de respuesta:', response.status);
        console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en la respuesta:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('📦 Datos completos recibidos:', data);
        
        // Verificar la estructura de datos
        if (data.data) {
            console.log('✅ Datos del cliente encontrados en data.data:', data.data);
            
            // Verificar campos específicos
            const clientData = data.data;
            console.log('👤 Nombre:', clientData.name);
            console.log('📧 Email:', clientData.email);
            console.log('📱 Teléfono:', clientData.phone);
            console.log('⚖️ Peso:', clientData.weight);
            console.log('📏 Altura:', clientData.height);
            console.log('🎯 Objetivos:', clientData.goals);
            console.log('📝 Objetivo inicial:', clientData.initialObjective);
            console.log('🏃 Días de entrenamiento:', clientData.trainingDaysPerWeek);
            console.log('🏥 Condiciones médicas:', clientData.medicalConditions);
            console.log('💊 Medicamentos:', clientData.medications);
            console.log('🩹 Lesiones:', clientData.injuries);
            
            // Verificar si hay clientProfile
            if (clientData.clientProfile) {
                console.log('📋 Perfil del cliente encontrado:', clientData.clientProfile);
                console.log('⚖️ Peso (perfil):', clientData.clientProfile.weight);
                console.log('📏 Altura (perfil):', clientData.clientProfile.height);
                console.log('🎯 Objetivos (perfil):', clientData.clientProfile.goals);
                console.log('📝 Objetivo inicial (perfil):', clientData.clientProfile.initialObjective);
                console.log('🏃 Días de entrenamiento (perfil):', clientData.clientProfile.trainingDaysPerWeek);
                console.log('🏥 Condiciones médicas (perfil):', clientData.clientProfile.medicalConditions);
                console.log('💊 Medicamentos (perfil):', clientData.clientProfile.medications);
                console.log('🩹 Lesiones (perfil):', clientData.clientProfile.injuries);
            }
            
        } else {
            console.log('⚠️ No se encontró data.data, estructura completa:', data);
        }
        
        // Verificar el estado actual del formulario
        console.log('\n🔍 Verificando estado actual del formulario...');
        
        const nameInput = document.querySelector('input[name="name"]');
        const emailInput = document.querySelector('input[name="email"]');
        const phoneInput = document.querySelector('input[name="phone"]');
        const weightInput = document.querySelector('input[name="weight"]');
        const heightInput = document.querySelector('input[name="height"]');
        
        console.log('📝 Valor actual del nombre:', nameInput?.value || 'No encontrado');
        console.log('📝 Valor actual del email:', emailInput?.value || 'No encontrado');
        console.log('📝 Valor actual del teléfono:', phoneInput?.value || 'No encontrado');
        console.log('📝 Valor actual del peso:', weightInput?.value || 'No encontrado');
        console.log('📝 Valor actual de la altura:', heightInput?.value || 'No encontrado');
        
    } catch (error) {
        console.error('❌ Error durante la depuración:', error);
    }
}

// Ejecutar la depuración
debugClientData();