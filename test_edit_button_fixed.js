const puppeteer = require('puppeteer');

async function testEditButtonFunctionality() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🚀 Iniciando prueba del botón de editar rutina...');
    
    // Ir a la página de login
    await page.goto('http://localhost:5174/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('📝 Iniciando sesión como trainer...');
    
    // Login como trainer
    await page.type('input[type="email"]', 'trainer@trainfit.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se cargue el dashboard
    await page.waitForSelector('.trainer-dashboard', { timeout: 10000 });
    console.log('✅ Login exitoso');
    
    // Buscar y hacer click en un cliente
    await page.waitForSelector('.client-card', { timeout: 5000 });
    const clientCards = await page.$$('.client-card');
    
    if (clientCards.length === 0) {
      console.log('❌ No se encontraron clientes');
      return;
    }
    
    console.log(`📋 Encontrados ${clientCards.length} clientes`);
    
    // Hacer click en el primer cliente
    await clientCards[0].click();
    
    // Esperar a que se cargue la página de progreso del cliente
    await page.waitForSelector('.trainer-client-progress-page', { timeout: 10000 });
    console.log('✅ Página de progreso del cliente cargada');
    
    // Buscar el botón de editar rutina
    const editButton = await page.$('.btn-edit');
    
    if (!editButton) {
      console.log('❌ No se encontró el botón de editar rutina');
      return;
    }
    
    console.log('✅ Botón de editar rutina encontrado');
    
    // Verificar que el botón tiene un handler onClick
    const hasOnClick = await page.evaluate((button) => {
      return button.onclick !== null || button.getAttribute('onclick') !== null;
    }, editButton);
    
    if (!hasOnClick) {
      console.log('❌ El botón de editar no tiene handler onClick');
      return;
    }
    
    console.log('✅ El botón de editar tiene handler onClick');
    
    // Hacer click en el botón de editar
    console.log('🖱️ Haciendo click en el botón de editar...');
    await editButton.click();
    
    // Esperar a que se navegue a la página de edición
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`🔗 URL actual: ${currentUrl}`);
    
    if (currentUrl.includes('/edit')) {
      console.log('✅ ¡Navegación exitosa a la página de edición!');
      console.log('🎉 ¡El botón de editar rutina funciona correctamente!');
    } else {
      console.log('❌ No se navegó a la página de edición');
    }
    
    // Verificar que la página de edición se carga correctamente
    try {
      await page.waitForSelector('.edit-routine-page, .min-h-screen', { timeout: 5000 });
      console.log('✅ Página de edición de rutina cargada correctamente');
    } catch (error) {
      console.log('⚠️ La página de edición puede no haberse cargado completamente');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await browser.close();
  }
}

testEditButtonFunctionality();