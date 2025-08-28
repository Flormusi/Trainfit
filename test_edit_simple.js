const puppeteer = require('puppeteer');

async function testEditButtonSimple() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  let page;
  
  try {
    page = await browser.newPage();
    
    console.log('🚀 Iniciando prueba simplificada del botón de editar rutina...');
    
    // Ir directamente a la página de progreso del cliente (si conocemos la URL)
    await page.goto('http://localhost:5174/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('📝 Iniciando sesión como trainer...');
    
    // Login como trainer - usando credenciales de prueba
    await page.type('input[type="email"]', 'test@trainfit.com');
    await page.type('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    // Esperar un poco más y verificar la URL
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`🔗 URL después del login: ${page.url()}`);
    
    // Verificar si estamos en el dashboard
    const dashboardExists = await page.$('.trainer-dashboard');
    if (dashboardExists) {
      console.log('✅ Dashboard encontrado');
      
      // Buscar clientes
      const clientCards = await page.$$('.client-card');
      console.log(`📋 Encontrados ${clientCards.length} clientes`);
      
      if (clientCards.length > 0) {
        // Hacer click en el primer cliente
        await clientCards[0].click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`🔗 URL después de click en cliente: ${page.url()}`);
        
        // Verificar si estamos en la página de progreso
        const progressPage = await page.$('.trainer-client-progress-page');
        if (progressPage) {
          console.log('✅ Página de progreso del cliente cargada');
          
          // Buscar el botón de editar
          const editButton = await page.$('.btn-edit');
          if (editButton) {
            console.log('✅ Botón de editar encontrado');
            
            // Hacer click en el botón
            await editButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log(`🔗 URL después de click en editar: ${page.url()}`);
            
            if (page.url().includes('/edit')) {
              console.log('🎉 ¡El botón de editar funciona correctamente!');
            } else {
              console.log('❌ El botón no navegó a la página de edición');
            }
          } else {
            console.log('❌ No se encontró el botón de editar');
          }
        } else {
          console.log('❌ No se cargó la página de progreso del cliente');
        }
      } else {
        console.log('❌ No se encontraron clientes');
      }
    } else {
      console.log('❌ Dashboard no encontrado');
      
      // Verificar si hay algún error en la página
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('📄 Contenido de la página:', bodyText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    if (page) {
      // Mantener el navegador abierto por un momento para inspección manual
      console.log('🔍 Manteniendo navegador abierto por 10 segundos para inspección...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    await browser.close();
  }
}

testEditButtonSimple();