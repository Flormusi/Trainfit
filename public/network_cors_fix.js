/**
 * Script para diagnosticar y reparar problemas de CORS y configuración de red
 * que pueden estar afectando la funcionalidad de la aplicación
 */

class NetworkCORSFix {
  constructor() {
    this.apiUrl = 'http://localhost:5002/api';
    this.frontendUrl = 'http://localhost:5173';
    this.networkIssues = [];
  }

  // Verificar configuración de CORS
  async checkCORSConfiguration() {
    console.log('🌐 Verificando configuración de CORS...');
    
    try {
      // Hacer una solicitud OPTIONS para verificar CORS
      const response = await fetch(`${this.apiUrl}/clients/profile`, {
        method: 'OPTIONS',
        headers: {
          'Origin': this.frontendUrl,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization, Content-Type'
        }
      });
      
      console.log('📡 Respuesta OPTIONS:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Verificar headers CORS
      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
        'access-control-allow-credentials': response.headers.get('access-control-allow-credentials')
      };
      
      console.log('🔍 Headers CORS:', corsHeaders);
      
      // Verificar si CORS está configurado correctamente
      const corsIssues = [];
      
      if (!corsHeaders['access-control-allow-origin'] || 
          (corsHeaders['access-control-allow-origin'] !== '*' && 
           corsHeaders['access-control-allow-origin'] !== this.frontendUrl)) {
        corsIssues.push('Origin no permitido');
      }
      
      if (!corsHeaders['access-control-allow-methods'] || 
          !corsHeaders['access-control-allow-methods'].includes('GET')) {
        corsIssues.push('Métodos no permitidos');
      }
      
      if (!corsHeaders['access-control-allow-headers'] || 
          !corsHeaders['access-control-allow-headers'].includes('Authorization')) {
        corsIssues.push('Headers de autorización no permitidos');
      }
      
      if (corsIssues.length > 0) {
        console.warn('⚠️ Problemas de CORS detectados:', corsIssues);
        this.networkIssues.push({ type: 'cors', issues: corsIssues });
        return false;
      } else {
        console.log('✅ Configuración de CORS correcta');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error al verificar CORS:', error);
      this.networkIssues.push({ type: 'cors_error', error: error.message });
      return false;
    }
  }

  // Verificar conectividad de red
  async checkNetworkConnectivity() {
    console.log('🔌 Verificando conectividad de red...');
    
    const endpoints = [
      { url: `${this.apiUrl}/health`, name: 'Health Check' },
      { url: `${this.apiUrl}/clients/profile`, name: 'Profile API', requiresAuth: true }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        
        if (endpoint.requiresAuth) {
          const token = localStorage.getItem('token') || 
                       sessionStorage.getItem('token') ||
                       document.cookie.match(/token=([^;]+)/)?.[1];
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
        
        const startTime = Date.now();
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: headers,
          timeout: 10000
        });
        const endTime = Date.now();
        
        const result = {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          ok: response.ok,
          responseTime: endTime - startTime,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        results.push(result);
        
        if (response.ok) {
          console.log(`✅ ${endpoint.name}: OK (${result.responseTime}ms)`);
        } else {
          console.warn(`⚠️ ${endpoint.name}: ${response.status} (${result.responseTime}ms)`);
          this.networkIssues.push({ 
            type: 'endpoint_error', 
            endpoint: endpoint.name, 
            status: response.status 
          });
        }
        
      } catch (error) {
        console.error(`❌ ${endpoint.name}: Error -`, error.message);
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          error: error.message,
          ok: false
        });
        
        this.networkIssues.push({ 
          type: 'connection_error', 
          endpoint: endpoint.name, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  // Interceptar y monitorear solicitudes de red
  setupNetworkInterceptor() {
    console.log('🕵️ Configurando interceptor de red...');
    
    // Interceptar fetch
    const originalFetch = window.fetch;
    const networkLogs = [];
    
    window.fetch = function(...args) {
      const url = args[0];
      const options = args[1] || {};
      const startTime = Date.now();
      
      console.log('📡 [FETCH] Iniciando:', {
        url: url,
        method: options.method || 'GET',
        headers: options.headers
      });
      
      return originalFetch.apply(this, args)
        .then(response => {
          const endTime = Date.now();
          const logEntry = {
            url: url,
            method: options.method || 'GET',
            status: response.status,
            ok: response.ok,
            responseTime: endTime - startTime,
            timestamp: new Date().toISOString()
          };
          
          networkLogs.push(logEntry);
          
          if (response.ok) {
            console.log('📡 [FETCH] ✅ Exitoso:', logEntry);
          } else {
            console.warn('📡 [FETCH] ⚠️ Error:', logEntry);
          }
          
          return response;
        })
        .catch(error => {
          const endTime = Date.now();
          const logEntry = {
            url: url,
            method: options.method || 'GET',
            error: error.message,
            responseTime: endTime - startTime,
            timestamp: new Date().toISOString()
          };
          
          networkLogs.push(logEntry);
          console.error('📡 [FETCH] ❌ Fallo:', logEntry);
          
          throw error;
        });
    };
    
    // Interceptar XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      
      xhr.open = function(method, url, ...args) {
        console.log('📡 [XHR] Iniciando:', { method, url });
        return originalOpen.apply(this, [method, url, ...args]);
      };
      
      xhr.send = function(...args) {
        const startTime = Date.now();
        
        xhr.addEventListener('load', function() {
          const endTime = Date.now();
          console.log('📡 [XHR] ✅ Completado:', {
            status: xhr.status,
            responseTime: endTime - startTime
          });
        });
        
        xhr.addEventListener('error', function() {
          const endTime = Date.now();
          console.error('📡 [XHR] ❌ Error:', {
            status: xhr.status,
            responseTime: endTime - startTime
          });
        });
        
        return originalSend.apply(this, args);
      };
      
      return xhr;
    };
    
    // Guardar referencia a los logs
    window.networkLogs = networkLogs;
    
    console.log('✅ Interceptor de red configurado');
  }

  // Verificar configuración de proxy/desarrollo
  checkDevelopmentConfiguration() {
    console.log('⚙️ Verificando configuración de desarrollo...');
    
    const config = {
      userAgent: navigator.userAgent,
      location: window.location.href,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port,
      origin: window.location.origin
    };
    
    console.log('🔍 Configuración actual:', config);
    
    // Verificar si estamos en el puerto correcto
    if (window.location.port !== '5173') {
      console.warn('⚠️ No estás en el puerto de desarrollo esperado (5173)');
      this.networkIssues.push({ 
        type: 'wrong_port', 
        expected: '5173', 
        actual: window.location.port 
      });
    }
    
    // Verificar protocolo
    if (window.location.protocol !== 'http:') {
      console.warn('⚠️ Protocolo inesperado:', window.location.protocol);
      this.networkIssues.push({ 
        type: 'wrong_protocol', 
        protocol: window.location.protocol 
      });
    }
    
    return config;
  }

  // Reparar problemas de red comunes
  async repairNetworkIssues() {
    console.log('🔧 Intentando reparar problemas de red...');
    
    let fixedCount = 0;
    
    // 1. Limpiar caché de red
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
        console.log('✅ Caché de red limpiado');
        fixedCount++;
      }
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar el caché:', error);
    }
    
    // 2. Reiniciar conexiones WebSocket si existen
    try {
      // Cerrar conexiones WebSocket existentes
      if (window.WebSocket) {
        console.log('🔄 Verificando conexiones WebSocket...');
        // No podemos acceder directamente a las conexiones, pero podemos intentar crear una nueva
      }
    } catch (error) {
      console.warn('⚠️ Error al manejar WebSocket:', error);
    }
    
    // 3. Forzar recarga de recursos críticos
    try {
      // Recargar axios config si existe
      if (window.axios) {
        window.axios.defaults.baseURL = this.apiUrl;
        console.log('✅ Configuración de axios actualizada');
        fixedCount++;
      }
    } catch (error) {
      console.warn('⚠️ Error al actualizar axios:', error);
    }
    
    return fixedCount;
  }

  // Ejecutar diagnóstico completo de red
  async runNetworkDiagnostic() {
    console.log('🚀 Ejecutando diagnóstico completo de red...');
    console.log('=' .repeat(50));
    
    // Limpiar problemas anteriores
    this.networkIssues = [];
    
    // 1. Verificar configuración de desarrollo
    const devConfig = this.checkDevelopmentConfiguration();
    
    // 2. Configurar interceptor
    this.setupNetworkInterceptor();
    
    // 3. Verificar CORS
    const corsOk = await this.checkCORSConfiguration();
    
    // 4. Verificar conectividad
    const connectivityResults = await this.checkNetworkConnectivity();
    
    // 5. Intentar reparaciones
    const fixedCount = await this.repairNetworkIssues();
    
    // Generar reporte
    console.log('\n📋 REPORTE DE DIAGNÓSTICO DE RED');
    console.log('=' .repeat(50));
    
    console.log('🔍 Configuración de desarrollo:', devConfig.origin);
    console.log('🌐 CORS:', corsOk ? '✅ OK' : '❌ Problemas detectados');
    console.log('🔌 Conectividad:', connectivityResults.filter(r => r.ok).length + '/' + connectivityResults.length + ' endpoints OK');
    console.log('🔧 Reparaciones aplicadas:', fixedCount);
    
    if (this.networkIssues.length > 0) {
      console.log('\n🚨 PROBLEMAS DETECTADOS:');
      this.networkIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}:`, issue);
      });
    } else {
      console.log('\n🎉 ¡No se detectaron problemas de red!');
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    if (!corsOk) {
      console.log('- Verificar configuración de CORS en el backend');
    }
    if (this.networkIssues.some(i => i.type === 'connection_error')) {
      console.log('- Verificar que el backend esté ejecutándose en el puerto 5002');
    }
    if (this.networkIssues.some(i => i.type === 'wrong_port')) {
      console.log('- Asegurarse de acceder desde http://localhost:5173');
    }
    
    return {
      corsOk,
      connectivity: connectivityResults,
      issues: this.networkIssues,
      fixed: fixedCount
    };
  }

  // Mostrar logs de red en tiempo real
  showNetworkLogs() {
    if (window.networkLogs && window.networkLogs.length > 0) {
      console.log('\n📊 LOGS DE RED RECIENTES:');
      window.networkLogs.slice(-10).forEach((log, index) => {
        const status = log.ok ? '✅' : '❌';
        console.log(`${status} ${log.method} ${log.url} - ${log.status || 'Error'} (${log.responseTime}ms)`);
      });
    } else {
      console.log('📊 No hay logs de red disponibles');
    }
  }
}

// Crear instancia global
window.networkCORSFix = new NetworkCORSFix();

// Ejecutar diagnóstico automático
setTimeout(() => {
  console.log('🌐 Ejecutando diagnóstico automático de red...');
  window.networkCORSFix.runNetworkDiagnostic();
}, 1000);

// Comandos disponibles en la consola
console.log('\n🛠️ COMANDOS DE DIAGNÓSTICO DE RED:');
console.log('networkCORSFix.runNetworkDiagnostic() - Diagnóstico completo');
console.log('networkCORSFix.checkCORSConfiguration() - Solo verificar CORS');
console.log('networkCORSFix.checkNetworkConnectivity() - Solo verificar conectividad');
console.log('networkCORSFix.repairNetworkIssues() - Intentar reparaciones');
console.log('networkCORSFix.showNetworkLogs() - Mostrar logs recientes');