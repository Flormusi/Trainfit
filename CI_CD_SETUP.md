# Configuración de CI/CD para TrainFit

Este documento describe cómo configurar un pipeline de Integración Continua y Despliegue Continuo (CI/CD) para el proyecto TrainFit, con énfasis en la ejecución automatizada de pruebas.

## Objetivos

- Automatizar la ejecución de pruebas unitarias, de integración y de rendimiento
- Garantizar la calidad del código antes de su despliegue
- Facilitar el despliegue automático a entornos de desarrollo, pruebas y producción
- Mantener un historial de ejecuciones de pruebas y despliegues

## Herramientas Recomendadas

### 1. GitHub Actions

Para proyectos alojados en GitHub, GitHub Actions ofrece una solución integrada para CI/CD.

#### Configuración Básica

Crea un archivo `.github/workflows/main.yml` con el siguiente contenido:

```yaml
name: TrainFit CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      # Configuración de servicios necesarios (PostgreSQL, etc.)
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: trainfit_test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install Backend Dependencies
      run: |
        cd backend
        npm ci
    
    - name: Install Frontend Dependencies
      run: |
        cd client
        npm ci
    
    - name: Setup Database
      run: |
        cd backend
        npx prisma migrate deploy
        npx prisma db seed
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/trainfit_test
    
    - name: Run Backend Tests
      run: |
        cd backend
        npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/trainfit_test
        JWT_SECRET: test_secret_key_for_ci
        NODE_ENV: test
    
    - name: Run Frontend Tests
      run: |
        cd client
        npm test
    
    - name: Generate Test Token
      run: |
        cd backend
        node test_api_with_token.js
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/trainfit_test
        JWT_SECRET: test_secret_key_for_ci
    
    - name: Start Backend Server
      run: |
        cd backend
        npm run dev &
        sleep 10
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/trainfit_test
        JWT_SECRET: test_secret_key_for_ci
        PORT: 5000
    
    - name: Run Integration Tests
      run: |
        cd client
        node src/tests/api_integration.test.js
    
    - name: Install k6
      run: |
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    
    - name: Run Performance Tests
      run: |
        cd backend
        k6 run src/tests/performance.k6.js
  
  deploy-dev:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Development
      run: |
        # Comandos para desplegar a entorno de desarrollo
        echo "Desplegando a entorno de desarrollo..."
  
  deploy-prod:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Production
      run: |
        # Comandos para desplegar a entorno de producción
        echo "Desplegando a entorno de producción..."
```

### 2. GitLab CI/CD

Para proyectos alojados en GitLab, puedes utilizar GitLab CI/CD.

#### Configuración Básica

Crea un archivo `.gitlab-ci.yml` en la raíz del proyecto:

```yaml
stages:
  - test
  - deploy-dev
  - deploy-prod

variables:
  DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/trainfit_test"
  JWT_SECRET: "test_secret_key_for_ci"
  NODE_ENV: "test"

services:
  - postgres:13

test:
  stage: test
  image: node:16
  script:
    # Instalar dependencias del backend
    - cd backend
    - npm ci
    - npx prisma migrate deploy
    - npx prisma db seed
    - npm test
    
    # Generar token de prueba
    - node test_api_with_token.js
    
    # Iniciar servidor en segundo plano
    - npm run dev &
    - sleep 10
    
    # Instalar dependencias del frontend
    - cd ../client
    - npm ci
    - npm test
    
    # Ejecutar pruebas de integración
    - node src/tests/api_integration.test.js
    
    # Instalar y ejecutar k6
    - apt-get update
    - apt-get install -y gnupg2
    - apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    - echo "deb https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list
    - apt-get update
    - apt-get install -y k6
    - cd ../backend
    - k6 run src/tests/performance.k6.js

deploy-dev:
  stage: deploy-dev
  image: node:16
  script:
    - echo "Desplegando a entorno de desarrollo..."
  only:
    - develop

deploy-prod:
  stage: deploy-prod
  image: node:16
  script:
    - echo "Desplegando a entorno de producción..."
  only:
    - main
```

### 3. Jenkins

Para entornos empresariales o equipos que ya utilizan Jenkins.

#### Configuración Básica

Crea un archivo `Jenkinsfile` en la raíz del proyecto:

```groovy
pipeline {
    agent any
    
    environment {
        DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/trainfit_test'
        JWT_SECRET = 'test_secret_key_for_ci'
        NODE_ENV = 'test'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                sh 'docker-compose up -d postgres'
                
                dir('backend') {
                    sh 'npm ci'
                    sh 'npx prisma migrate deploy'
                    sh 'npx prisma db seed'
                }
                
                dir('client') {
                    sh 'npm ci'
                }
            }
        }
        
        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        
        stage('Frontend Tests') {
            steps {
                dir('client') {
                    sh 'npm test'
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                dir('backend') {
                    sh 'node test_api_with_token.js'
                    sh 'npm run dev &'
                    sh 'sleep 10'
                }
                
                dir('client') {
                    sh 'node src/tests/api_integration.test.js'
                }
            }
        }
        
        stage('Performance Tests') {
            steps {
                sh 'apt-get update && apt-get install -y gnupg2'
                sh 'apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69'
                sh 'echo "deb https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list'
                sh 'apt-get update && apt-get install -y k6'
                
                dir('backend') {
                    sh 'k6 run src/tests/performance.k6.js'
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Desplegando a entorno de desarrollo...'
                // Comandos de despliegue
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Desplegando a entorno de producción...'
                // Comandos de despliegue
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose down'
            cleanWs()
        }
    }
}
```

## Configuración de Entornos

### Entorno de Desarrollo

- **Propósito**: Pruebas rápidas y desarrollo continuo
- **Despliegue**: Automático tras cada push a la rama `develop`
- **Base de datos**: Instancia de desarrollo con datos de prueba
- **URL**: `https://dev.trainfit.com`

### Entorno de Pruebas (Staging)

- **Propósito**: Pruebas exhaustivas antes de producción
- **Despliegue**: Manual o automático tras aprobación
- **Base de datos**: Copia reciente de producción (anonimizada)
- **URL**: `https://staging.trainfit.com`

### Entorno de Producción

- **Propósito**: Aplicación en vivo para usuarios finales
- **Despliegue**: Manual tras aprobación
- **Base de datos**: Base de datos de producción
- **URL**: `https://trainfit.com`

## Mejores Prácticas

1. **Pruebas Automatizadas**: Todas las pruebas deben ejecutarse automáticamente en el pipeline.

2. **Entornos Aislados**: Cada entorno debe estar completamente aislado de los demás.

3. **Secretos y Variables de Entorno**: Utiliza las funcionalidades de secretos de la plataforma de CI/CD para almacenar información sensible.

4. **Notificaciones**: Configura notificaciones para informar al equipo sobre el estado de las ejecuciones.

5. **Artefactos**: Guarda los informes de pruebas y otros artefactos generados durante el proceso.

6. **Rollback Automático**: Configura mecanismos de rollback automático en caso de fallos en el despliegue.

7. **Monitoreo Post-Despliegue**: Implementa monitoreo para detectar problemas después del despliegue.

## Ejemplo de Flujo de Trabajo

1. Un desarrollador crea una rama feature desde `develop`
2. Trabaja en la característica y ejecuta pruebas localmente
3. Crea un Pull Request para integrar los cambios en `develop`
4. El pipeline de CI/CD se ejecuta automáticamente
5. Si todas las pruebas pasan, los cambios se pueden fusionar
6. Al fusionar, se despliega automáticamente al entorno de desarrollo
7. Después de validar en desarrollo, se crea un PR de `develop` a `main`
8. Al aprobar y fusionar, se despliega a producción

## Recursos Adicionales

- [Documentación de GitHub Actions](https://docs.github.com/es/actions)
- [Documentación de GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Documentación de Jenkins](https://www.jenkins.io/doc/)
- [Documentación de k6](https://k6.io/docs/)

## Solución de Problemas Comunes

### Fallos en las Pruebas

1. **Problema**: Las pruebas fallan en CI pero funcionan localmente
   **Solución**: Verifica las diferencias de entorno, especialmente variables de entorno y versiones de dependencias

2. **Problema**: Tiempos de espera en pruebas de integración
   **Solución**: Aumenta los tiempos de espera en el pipeline y asegúrate de que los servicios estén completamente iniciados

3. **Problema**: Fallos intermitentes en pruebas
   **Solución**: Implementa reintentos para pruebas inestables y trabaja en mejorar su determinismo

### Problemas de Despliegue

1. **Problema**: Fallos en el despliegue a producción
   **Solución**: Realiza primero un despliegue a staging y verifica que todo funcione correctamente

2. **Problema**: Diferencias entre entornos
   **Solución**: Utiliza Docker o herramientas similares para garantizar la consistencia entre entornos