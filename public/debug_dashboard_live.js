// Script para debuggear el dashboard en tiempo real
console.log('🔍 Iniciando debugging del dashboard...');

// 1. Verificar usuario actual
async function checkCurrentUser() {
    console.log('👤 Verificando usuario actual...');
    
    // Verificar localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Token:', token ? 'Presente' : 'No encontrado');
    console.log('User data:', userData ? JSON.parse(userData) : 'No encontrado');
    
    if (userData) {
        const user = JSON.parse(userData);
        console.log('Usuario logueado:', user.name, '- ID:', user.id, '- Rol:', user.role);
        return user;
    }
    
    return null;
}

// 2. Llamar directamente a la API del dashboard
async function checkDashboardAPI() {
    console.log('🌐 Verificando API del dashboard...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ No hay token disponible');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5002/api/trainer/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Respuesta de la API:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos del dashboard:', data);
            console.log('👥 Conteo de clientes:', data.data?.clientCount);
            console.log('📊 Rutinas:', data.data?.routineCount);
            console.log('💪 Ejercicios:', data.data?.exerciseCount);
            return data;
        } else {
            const errorData = await response.text();
            console.error('❌ Error en la API:', errorData);
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}

// 3. Verificar el estado del componente React
function checkReactState() {
    console.log('⚛️ Verificando estado de React...');
    
    // Buscar elementos del dashboard
    const dashboardElement = document.querySelector('[data-testid="dashboard"]') || 
                           document.querySelector('.dashboard') ||
                           document.querySelector('main');
    
    if (dashboardElement) {
        console.log('📱 Elemento dashboard encontrado:', dashboardElement);
        
        // Buscar el texto de "Alumnos Activos"
        const activeStudentsText = document.querySelector('*')?.innerText?.includes('Alumnos Activos');
        if (activeStudentsText) {
            console.log('📝 Texto "Alumnos Activos" encontrado en la página');
        }
        
        // Buscar números en el dashboard
        const numbers = Array.from(document.querySelectorAll('*'))
            .map(el => el.textContent)
            .filter(text => /^\d+$/.test(text?.trim()));
        
        console.log('🔢 Números encontrados en el dashboard:', numbers);
    } else {
        console.log('❌ No se encontró elemento dashboard');
    }
}

// 4. Función principal de debugging
async function debugDashboard() {
    console.log('🚀 === DEBUGGING DASHBOARD ===');
    
    const user = await checkCurrentUser();
    const dashboardData = await checkDashboardAPI();
    checkReactState();
    
    console.log('📋 === RESUMEN ===');
    console.log('Usuario:', user?.name || 'No logueado');
    console.log('Datos API:', dashboardData?.clientCount || 'No disponible');
    console.log('=================');
    
    return { user, dashboardData };
}

// 5. Función para refrescar datos
async function refreshDashboard() {
    console.log('🔄 Refrescando dashboard...');
    
    // Intentar disparar un re-render
    const event = new Event('storage');
    window.dispatchEvent(event);
    
    // Esperar un poco y verificar de nuevo
    setTimeout(async () => {
        await debugDashboard();
    }, 1000);
}

// Ejecutar automáticamente
debugDashboard();

// Exponer funciones globalmente para uso manual
window.debugDashboard = debugDashboard;
window.refreshDashboard = refreshDashboard;

console.log('✅ Script cargado. Usa debugDashboard() o refreshDashboard() para ejecutar manualmente.');