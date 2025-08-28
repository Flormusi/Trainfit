/**
 * Script de diagnóstico completo para verificar la comunicación frontend-backend
 * y detectar problemas de funcionalidad en la aplicación
 */

class FrontendBackendDiagnostic {
  constructor() {
    this.apiUrl = 'http://localhost:5002/api';
    this.token = this.getToken();
    this.results = [];
  }

  getToken() {
    // Intentar obtener el token de diferentes fuentes
    const sources = [
      () => localStorage.getItem('token'),
      () => localStorage.getItem('authToken'),
      () => sessionStorage.getItem('token'),
      () => document.cookie.match(/token=([^;]+)/)?.[1]
    ];

    for (const getTokenFn of sources) {
      try {
        const token = getTokenFn();
        if (token) {
          console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
          return token;
        }
      } catch (e) {
        // Continuar con el siguiente método
      }
    }
    
    console.warn('⚠️ No se encontró token de autenticación');
    return null;
  }

  async testApiConnection() {
    console.log('\n🔗 Probando conexión con el backend...');
    
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Conexión con backend exitosa');
        this.results.push({ test: 'Backend Connection', status: 'PASS' });
        return true;
      } else {
        console.error('❌ Backend respondió con error:', response.status);
        this.results.push({ test: 'Backend Connection', status: 'FAIL', error: `Status ${response.status}` });
        return false;
      }
    } catch (error) {
      console.error('❌ Error de conexión con backend:', error);
      this.results.push({ test: 'Backend Connection', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Probando autenticación...');
    
    if (!this.token) {
      console.error('❌ No hay token disponible');
      this.results.push({ test: 'Authentication', status: 'FAIL', error: 'No token found' });
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/clients/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Autenticación exitosa, perfil obtenido:', data);
        this.results.push({ test: 'Authentication', status: 'PASS' });
        return true;
      } else {
        console.error('❌ Error de autenticación:', response.status);
        this.results.push({ test: 'Authentication', status: 'FAIL', error: `Status ${response.status}` });
        return false;
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      this.results.push({ test: 'Authentication', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testRoutinesAPI() {
    console.log('\n🏋️ Probando API de rutinas...');
    
    if (!this.token) {
      console.error('❌ No hay token para probar rutinas');
      this.results.push({ test: 'Routines API', status: 'FAIL', error: 'No token' });
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/clients/profile/routines`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API de rutinas funcionando:', data);
        this.results.push({ test: 'Routines API', status: 'PASS', data: data });
        return true;
      } else {
        console.error('❌ Error en API de rutinas:', response.status);
        this.results.push({ test: 'Routines API', status: 'FAIL', error: `Status ${response.status}` });
        return false;
      }
    } catch (error) {
      console.error('❌ Error en API de rutinas:', error);
      this.results.push({ test: 'Routines API', status: 'FAIL', error: error.message });
      return false;
    }
  }

  checkJavaScriptErrors() {
    console.log('\n🐛 Verificando errores de JavaScript...');
    
    // Capturar errores de JavaScript
    const originalError = window.onerror;
    const errors = [];
    
    window.onerror = function(message, source, lineno, colno, error) {
      errors.push({ message, source, lineno, colno, error });
      console.error('🚨 Error de JavaScript capturado:', { message, source, lineno, colno });
      if (originalError) originalError.apply(this, arguments);
    };

    // Verificar errores de promesas no manejadas
    window.addEventListener('unhandledrejection', function(event) {
      errors.push({ type: 'unhandledrejection', reason: event.reason });
      console.error('🚨 Promesa rechazada no manejada:', event.reason);
    });

    setTimeout(() => {
      if (errors.length === 0) {
        console.log('✅ No se detectaron errores de JavaScript');
        this.results.push({ test: 'JavaScript Errors', status: 'PASS' });
      } else {
        console.error('❌ Se detectaron errores de JavaScript:', errors);
        this.results.push({ test: 'JavaScript Errors', status: 'FAIL', errors: errors });
      }
    }, 2000);
  }

  checkDOMElements() {
    console.log('\n🎯 Verificando elementos del DOM...');
    
    const criticalElements = [
      { selector: '[data-testid="routine-card"]', name: 'Routine Cards' },
      { selector: 'button', name: 'Buttons' },
      { selector: '[class*="dashboard"]', name: 'Dashboard Elements' },
      { selector: '[class*="routine"]', name: 'Routine Elements' }
    ];

    criticalElements.forEach(({ selector, name }) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✅ ${name} encontrados: ${elements.length}`);
        this.results.push({ test: `DOM - ${name}`, status: 'PASS', count: elements.length });
      } else {
        console.warn(`⚠️ ${name} no encontrados`);
        this.results.push({ test: `DOM - ${name}`, status: 'WARN', count: 0 });
      }
    });
  }

  checkEventListeners() {
    console.log('\n👂 Verificando event listeners...');
    
    const buttons = document.querySelectorAll('button');
    let workingButtons = 0;
    let totalButtons = buttons.length;

    buttons.forEach((button, index) => {
      // Verificar si el botón tiene event listeners
      const hasClickHandler = button.onclick !== null || 
                             button.addEventListener !== undefined;
      
      if (hasClickHandler || button.getAttribute('onclick')) {
        workingButtons++;
      }
    });

    console.log(`📊 Botones con event listeners: ${workingButtons}/${totalButtons}`);
    this.results.push({ 
      test: 'Event Listeners', 
      status: workingButtons > 0 ? 'PASS' : 'FAIL', 
      working: workingButtons, 
      total: totalButtons 
    });
  }

  checkNetworkRequests() {
    console.log('\n🌐 Monitoreando solicitudes de red...');
    
    // Interceptar fetch requests
    const originalFetch = window.fetch;
    const networkRequests = [];
    
    window.fetch = function(...args) {
      const url = args[0];
      const options = args[1] || {};
      
      console.log('📡 Solicitud de red:', url, options.method || 'GET');
      networkRequests.push({ url, method: options.method || 'GET', timestamp: Date.now() });
      
      return originalFetch.apply(this, args)
        .then(response => {
          console.log('📡 Respuesta recibida:', url, response.status);
          return response;
        })
        .catch(error => {
          console.error('📡 Error en solicitud:', url, error);
          throw error;
        });
    };

    setTimeout(() => {
      console.log('📊 Solicitudes de red capturadas:', networkRequests.length);
      this.results.push({ 
        test: 'Network Requests', 
        status: 'INFO', 
        requests: networkRequests 
      });
    }, 5000);
  }

  async runFullDiagnostic() {
    console.log('🚀 Iniciando diagnóstico completo...');
    console.log('=' .repeat(50));
    
    // Limpiar resultados anteriores
    this.results = [];
    
    // Ejecutar todas las pruebas
    await this.testApiConnection();
    await this.testAuthentication();
    await this.testRoutinesAPI();
    this.checkJavaScriptErrors();
    this.checkDOMElements();
    this.checkEventListeners();
    this.checkNetworkRequests();
    
    // Esperar un poco para que se completen las pruebas asíncronas
    setTimeout(() => {
      this.generateReport();
    }, 6000);
  }

  generateReport() {
    console.log('\n📋 REPORTE DE DIAGNÓSTICO');
    console.log('=' .repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`✅ Pruebas exitosas: ${passed}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`⚠️ Advertencias: ${warnings}`);
    
    console.log('\n📊 Detalles:');
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'FAIL' ? '❌' : 
                   result.status === 'WARN' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      if (result.count !== undefined) console.log(`   Cantidad: ${result.count}`);
    });
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    if (failed > 0) {
      console.log('- Revisar los errores específicos mostrados arriba');
      console.log('- Verificar que el backend esté ejecutándose en el puerto 5002');
      console.log('- Comprobar que el token de autenticación sea válido');
    }
    if (warnings > 0) {
      console.log('- Algunos elementos del DOM no se encontraron, esto puede ser normal dependiendo de la página actual');
    }
    if (passed === this.results.filter(r => r.status !== 'INFO').length) {
      console.log('🎉 ¡Todas las pruebas principales pasaron! El problema puede ser específico de la interfaz de usuario.');
    }
  }

  // Método para ejecutar una prueba específica
  async runSpecificTest(testName) {
    switch(testName) {
      case 'connection':
        return await this.testApiConnection();
      case 'auth':
        return await this.testAuthentication();
      case 'routines':
        return await this.testRoutinesAPI();
      case 'dom':
        return this.checkDOMElements();
      case 'events':
        return this.checkEventListeners();
      default:
        console.error('❌ Prueba no reconocida:', testName);
        return false;
    }
  }
}

// Crear instancia global
window.frontendBackendDiagnostic = new FrontendBackendDiagnostic();

// Ejecutar diagnóstico automáticamente al cargar
setTimeout(() => {
  console.log('🔍 Ejecutando diagnóstico automático...');
  window.frontendBackendDiagnostic.runFullDiagnostic();
}, 2000);

// Comandos disponibles en la consola
console.log('\n🛠️ COMANDOS DISPONIBLES:');
console.log('frontendBackendDiagnostic.runFullDiagnostic() - Ejecutar diagnóstico completo');
console.log('frontendBackendDiagnostic.runSpecificTest("connection") - Probar conexión');
console.log('frontendBackendDiagnostic.runSpecificTest("auth") - Probar autenticación');
console.log('frontendBackendDiagnostic.runSpecificTest("routines") - Probar API de rutinas');
console.log('frontendBackendDiagnostic.runSpecificTest("dom") - Verificar DOM');
console.log('frontendBackendDiagnostic.runSpecificTest("events") - Verificar event listeners');