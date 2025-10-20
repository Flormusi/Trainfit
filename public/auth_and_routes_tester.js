// Script para probar autenticación y rutas del backend
(function() {
    console.log('🔍 Auth and Routes Tester iniciado');
    
    const API_BASE_URL = 'http://localhost:5002/api';
    
    // Función para obtener el token del localStorage
    const getToken = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
        if (token) {
            console.log('🔑 Token (primeros 20 caracteres):', token.substring(0, 20) + '...');
        }
        return token;
    };
    
    // Función para hacer una solicitud autenticada
    const makeAuthenticatedRequest = async (url, method = 'GET', body = null) => {
        const token = getToken();
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        try {
            console.log(`📡 Haciendo solicitud ${method} a:`, url);
            console.log('📡 Headers:', options.headers);
            
            const response = await fetch(url, options);
            
            console.log(`📡 Respuesta ${response.status}:`, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Datos recibidos:', data);
                return { success: true, data, status: response.status };
            } else {
                const errorText = await response.text();
                console.log('❌ Error:', errorText);
                return { success: false, error: errorText, status: response.status };
            }
        } catch (error) {
            console.log('❌ Error de red:', error);
            return { success: false, error: error.message, status: 0 };
        }
    };
    
    // Función para probar rutas específicas
    const testRoutes = async () => {
        console.log('\n🧪 INICIANDO PRUEBAS DE RUTAS...');
        
        // 1. Probar health check
        console.log('\n1. Probando health check...');
        const healthResult = await makeAuthenticatedRequest(`${API_BASE_URL}/health`);
        
        // 2. Probar autenticación
        console.log('\n2. Probando ruta de prueba de clientes...');
        const clientTestResult = await makeAuthenticatedRequest(`${API_BASE_URL}/clients/test`);
        
        // 3. Obtener perfil del usuario actual
        const token = getToken();
        if (token) {
            try {
                // Decodificar el token para obtener el ID del usuario
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.id;
                console.log('👤 ID del usuario desde token:', userId);
                
                console.log('\n3. Probando obtener perfil del usuario...');
                const profileResult = await makeAuthenticatedRequest(`${API_BASE_URL}/clients/${userId}/profile`);
                
                console.log('\n4. Probando obtener rutinas del usuario...');
                const routinesResult = await makeAuthenticatedRequest(`${API_BASE_URL}/clients/routines`);
                
                console.log('\n5. Probando obtener rutinas asignadas...');
                const assignedRoutinesResult = await makeAuthenticatedRequest(`${API_BASE_URL}/clients/${userId}/assigned-routines`);
                
            } catch (error) {
                console.log('❌ Error decodificando token:', error);
            }
        }
        
        // 6. Probar rutas sin autenticación
        console.log('\n6. Probando rutas sin autenticación...');
        const noAuthResult = await makeAuthenticatedRequest(`${API_BASE_URL}/clients/routines`);
        
        console.log('\n📋 RESUMEN DE PRUEBAS:');
        console.log('  - Health check:', healthResult.success ? '✅' : '❌');
        console.log('  - Client test:', clientTestResult.success ? '✅' : '❌');
        console.log('  - Token presente:', getToken() ? '✅' : '❌');
    };
    
    // Función para verificar el estado de autenticación en el contexto de React
    const checkReactAuthContext = () => {
        console.log('\n🔍 Verificando contexto de autenticación de React...');
        
        // Buscar elementos que indiquen el estado de autenticación
        const authElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"], [id*="auth"]');
        console.log(`🔍 Elementos relacionados con auth: ${authElements.length}`);
        
        // Verificar si hay mensajes de error de autenticación
        const errorElements = document.querySelectorAll('.error, [class*="error"], [data-error]');
        console.log(`❌ Elementos de error: ${errorElements.length}`);
        
        errorElements.forEach((el, index) => {
            const text = el.textContent?.toLowerCase() || '';
            if (text.includes('auth') || text.includes('login') || text.includes('token')) {
                console.log(`❌ Error de auth ${index + 1}:`, el.textContent);
            }
        });
        
        // Verificar si hay elementos de loading
        const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], .skeleton');
        console.log(`⏳ Elementos de loading: ${loadingElements.length}`);
        
        // Verificar localStorage completo
        console.log('\n💾 Contenido de localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`  ${key}:`, value?.substring(0, 50) + (value?.length > 50 ? '...' : ''));
        }
    };
    
    // Función para interceptar solicitudes de red
    const interceptNetworkRequests = () => {
        console.log('\n🌐 Configurando interceptor de solicitudes de red...');
        
        // Interceptar fetch
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            const url = args[0];
            const options = args[1] || {};
            
            console.log('🌐 Fetch interceptado:', url);
            console.log('🌐 Options:', options);
            
            try {
                const response = await originalFetch.apply(this, args);
                console.log(`🌐 Respuesta fetch ${response.status}:`, url);
                
                if (!response.ok) {
                    console.log('❌ Fetch falló:', response.status, response.statusText);
                }
                
                return response;
            } catch (error) {
                console.log('❌ Error en fetch:', error);
                throw error;
            }
        };
        
        console.log('✅ Interceptor de fetch configurado');
    };
    
    // Ejecutar todas las pruebas
    setTimeout(async () => {
        checkReactAuthContext();
        interceptNetworkRequests();
        await testRoutes();
        
        // Configurar monitoreo continuo
        setInterval(() => {
            const token = getToken();
            if (!token) {
                console.log('⚠️ Token perdido - usuario posiblemente desautenticado');
            }
        }, 10000); // Verificar cada 10 segundos
        
    }, 2000);
    
    console.log('✅ Auth and Routes Tester configurado');
})();