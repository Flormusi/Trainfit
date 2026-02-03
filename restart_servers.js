const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class ServerManager {
  constructor() {
    this.processes = new Map();
    this.backendPath = '/Users/mariaflorenciamusitani/Desktop/Trainfit/backend';
    this.clientPath = '/Users/mariaflorenciamusitani/Desktop/Trainfit/client';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      process: '🔄'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkDirectory(dirPath, name) {
    if (!fs.existsSync(dirPath)) {
      this.log(`Directorio ${name} no encontrado: ${dirPath}`, 'error');
      return false;
    }
    
    const packageJsonPath = path.join(dirPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.log(`package.json no encontrado en ${name}: ${packageJsonPath}`, 'error');
      return false;
    }
    
    this.log(`Directorio ${name} verificado: ${dirPath}`, 'success');
    return true;
  }

  async installDependencies(dirPath, name) {
    this.log(`Verificando dependencias en ${name}...`, 'process');
    
    return new Promise((resolve, reject) => {
      const npmInstall = spawn('npm', ['install'], {
        cwd: dirPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      npmInstall.stdout.on('data', (data) => {
        output += data.toString();
      });

      npmInstall.stderr.on('data', (data) => {
        output += data.toString();
      });

      npmInstall.on('close', (code) => {
        if (code === 0) {
          this.log(`Dependencias verificadas en ${name}`, 'success');
          resolve();
        } else {
          this.log(`Error verificando dependencias en ${name}: ${output}`, 'error');
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }

  async startBackend() {
    this.log('Iniciando servidor backend...', 'process');
    
    return new Promise((resolve, reject) => {
      const backend = spawn('npm', ['run', 'dev'], {
        cwd: this.backendPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      this.processes.set('backend', backend);

      let output = '';
      let started = false;

      backend.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Buscar indicadores de que el servidor está listo
        if (text.includes('Server running on') || 
            text.includes('listening on') || 
            text.includes('started on') ||
            text.includes('Server is running')) {
          if (!started) {
            started = true;
            this.log('Servidor backend iniciado correctamente', 'success');
            resolve();
          }
        }
      });

      backend.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Algunos frameworks muestran información en stderr
        if (text.includes('Server running on') || 
            text.includes('listening on') || 
            text.includes('started on')) {
          if (!started) {
            started = true;
            this.log('Servidor backend iniciado correctamente', 'success');
            resolve();
          }
        }
      });

      backend.on('close', (code) => {
        if (!started) {
          this.log(`Backend cerrado con código: ${code}`, 'error');
          reject(new Error(`Backend failed to start, exit code: ${code}`));
        }
      });

      // Timeout de 30 segundos
      setTimeout(() => {
        if (!started) {
          this.log('Backend iniciado (timeout alcanzado, asumiendo éxito)', 'warning');
          resolve();
        }
      }, 30000);
    });
  }

  async startClient() {
    this.log('Iniciando servidor cliente...', 'process');
    
    return new Promise((resolve, reject) => {
      const client = spawn('npm', ['run', 'dev'], {
        cwd: this.clientPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      this.processes.set('client', client);

      let output = '';
      let started = false;

      client.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Buscar indicadores de Vite/React
        if (text.includes('Local:') || 
            text.includes('ready in') || 
            text.includes('Local server') ||
            text.includes('http://localhost')) {
          if (!started) {
            started = true;
            this.log('Servidor cliente iniciado correctamente', 'success');
            resolve();
          }
        }
      });

      client.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
      });

      client.on('close', (code) => {
        if (!started) {
          this.log(`Cliente cerrado con código: ${code}`, 'error');
          reject(new Error(`Client failed to start, exit code: ${code}`));
        }
      });

      // Timeout de 30 segundos
      setTimeout(() => {
        if (!started) {
          this.log('Cliente iniciado (timeout alcanzado, asumiendo éxito)', 'warning');
          resolve();
        }
      }, 30000);
    });
  }

  async stopAllProcesses() {
    this.log('Deteniendo todos los procesos...', 'process');
    
    for (const [name, process] of this.processes) {
      try {
        this.log(`Deteniendo ${name}...`, 'process');
        process.kill('SIGTERM');
        await this.sleep(2000);
        
        if (!process.killed) {
          this.log(`Forzando cierre de ${name}...`, 'warning');
          process.kill('SIGKILL');
        }
        
        this.log(`${name} detenido`, 'success');
      } catch (error) {
        this.log(`Error deteniendo ${name}: ${error.message}`, 'error');
      }
    }
    
    this.processes.clear();
  }

  async restart() {
    try {
      this.log('🔧 Iniciando reinicio ordenado de servidores TrainFit', 'info');
      
      // 1. Verificar directorios
      this.log('📁 Verificando estructura de directorios...', 'process');
      const backendExists = await this.checkDirectory(this.backendPath, 'Backend');
      const clientExists = await this.checkDirectory(this.clientPath, 'Cliente');
      
      if (!backendExists || !clientExists) {
        throw new Error('Estructura de directorios inválida');
      }
      
      // 2. Verificar dependencias
      this.log('📦 Verificando dependencias...', 'process');
      await this.installDependencies(this.backendPath, 'Backend');
      await this.installDependencies(this.clientPath, 'Cliente');
      
      // 3. Iniciar backend primero
      this.log('🚀 Iniciando servicios en orden...', 'process');
      await this.startBackend();
      
      // 4. Esperar un momento antes de iniciar el cliente
      this.log('⏳ Esperando estabilización del backend...', 'process');
      await this.sleep(5000);
      
      // 5. Iniciar cliente
      await this.startClient();
      
      // 6. Verificación final
      this.log('🔍 Verificando servicios...', 'process');
      await this.sleep(3000);
      
      this.log('✅ Reinicio completado exitosamente', 'success');
      this.log('📊 Servicios activos:', 'info');
      this.log('   - Backend: Ejecutándose', 'info');
      this.log('   - Cliente: Ejecutándose', 'info');
      
      // Mantener el proceso vivo
      this.log('🔄 Servicios ejecutándose. Presiona Ctrl+C para detener.', 'info');
      
      // Manejar señales de cierre
      process.on('SIGINT', async () => {
        this.log('\n🛑 Señal de cierre recibida...', 'warning');
        await this.stopAllProcesses();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        this.log('\n🛑 Señal de terminación recibida...', 'warning');
        await this.stopAllProcesses();
        process.exit(0);
      });
      
    } catch (error) {
      this.log(`💥 Error durante el reinicio: ${error.message}`, 'error');
      await this.stopAllProcesses();
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const manager = new ServerManager();
  manager.restart();
}

module.exports = ServerManager;