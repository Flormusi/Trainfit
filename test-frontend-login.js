const puppeteer = require('puppeteer');

async function testFrontendLogin() {
  console.log('🚀 Iniciando prueba de login en frontend...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navegar a la página de login
    console.log('📱 Navegando a http://localhost:5173/login');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Esperar a que aparezcan los campos de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    console.log('✅ Página de login cargada correctamente');
    
    // Llenar el formulario de login
    console.log('📝 Llenando credenciales de prueba...');
    await page.type('input[type="email"]', 'test.trainer@trainfit.com');
    await page.type('input[type="password"]', 'test123');
    
    // Hacer click en el botón de login
    console.log('🔐 Intentando hacer login...');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login (puede redirigir al dashboard)
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    const currentUrl = page.url();
    console.log(`📍 URL actual después del login: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/trainer')) {
      console.log('✅ Login exitoso - Redirigido al dashboard');
      
      // Buscar elementos que indiquen que estamos logueados
      const userInfo = await page.$('.user-info, .trainer-info, [data-testid="user-menu"]');
      if (userInfo) {
        console.log('✅ Elementos de usuario encontrados en la interfaz');
      }
      
      return true;
    } else {
      console.log('❌ Login falló - No se redirigió correctamente');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    return false;
  } finally {
    // Mantener el navegador abierto por 5 segundos para inspección
    console.log('⏳ Manteniendo navegador abierto por 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

// Ejecutar la prueba
testFrontendLogin()
  .then(success => {
    if (success) {
      console.log('🎉 Prueba de login completada exitosamente');
      process.exit(0);
    } else {
      console.log('💥 Prueba de login falló');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });