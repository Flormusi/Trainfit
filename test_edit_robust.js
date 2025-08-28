const puppeteer = require('puppeteer');

async function testEditButtonRobust() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
    slowMo: 100 // Añadir un pequeño delay entre acciones
  });
  
  let page;
  
  try {
    page = await browser.newPage();
    
    console.log('🚀 Iniciando prueba robusta del botón de editar rutina...');
    
    // Ir a la página de login
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
    console.log('📄 Página de login cargada');
    
    // Esperar a que aparezcan los campos de login
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    
    console.log('📝 Campos de login encontrados, iniciando sesión...');
    
    // Limpiar campos y escribir credenciales
    await page.click('input[name="email"]', { clickCount: 3 });
    await page.type('input[name="email"]', 'test@trainfit.com');
    
    await page.click('input[name="password"]', { clickCount: 3 });
    await page.type('input[name="password"]', 'test123');
    
    // Hacer click en el botón de submit
    await page.click('button[type="submit"]');
    
    console.log('🔄 Esperando redirección después del login...');
    
    // Esperar a que la URL cambie o aparezca el dashboard
    await page.waitForFunction(
      () => window.location.href !== 'http://localhost:5174/login',
      { timeout: 15000 }
    );
    
    console.log(`🔗 URL después del login: ${page.url()}`);
    
    // Esperar a que aparezca el dashboard del trainer
    try {
      await page.waitForSelector('.trainer-dashboard', { timeout: 10000 });
      console.log('✅ Dashboard del trainer cargado');
    } catch (error) {
      console.log('⚠️ Dashboard no encontrado con selector .trainer-dashboard, intentando otros selectores...');
      
      // Intentar otros selectores posibles
      const possibleSelectors = [
        '.dashboard-container',
        '.trainer-dashboard-container',
        '[class*="dashboard"]',
        'h1, h2, h3' // Buscar títulos
      ];
      
      for (const selector of possibleSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          console.log(`✅ Encontrado elemento con selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`❌ No encontrado: ${selector}`);
        }
      }
    }
    
    // Buscar clientes en la página
    console.log('🔍 Buscando clientes en la página...');
    
    // Esperar un poco para que la página se cargue completamente
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Buscar diferentes tipos de elementos que podrían representar clientes
    const clientSelectors = [
      '.client-card',
      '.client-item',
      '[class*="client"]',
      '.card',
      '.user-card'
    ];
    
    let clientElements = [];
    for (const selector of clientSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`📋 Encontrados ${elements.length} elementos con selector: ${selector}`);
          clientElements = elements;
          break;
        }
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }
    
    if (clientElements.length === 0) {
      console.log('❌ No se encontraron elementos de cliente. Verificando contenido de la página...');
      
      // Obtener todo el texto de la página para debug
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('📄 Contenido de la página (primeros 500 caracteres):');
      console.log(pageText.substring(0, 500));
      
      // Buscar cualquier elemento clickeable que pueda ser un cliente
      const clickableElements = await page.$$('button, a, div[onclick], [role="button"]');
      console.log(`🔍 Encontrados ${clickableElements.length} elementos clickeables`);
      
      if (clickableElements.length > 0) {
        console.log('🎯 Intentando hacer click en el primer elemento clickeable...');
        await clickableElements[0].click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(`🔗 URL después del click: ${page.url()}`);
      }
    } else {
      console.log('🎯 Haciendo click en el primer cliente...');
      await clientElements[0].click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log(`🔗 URL después del click en cliente: ${page.url()}`);
    }
    
    // Buscar el botón de editar en la nueva página
    console.log('🔍 Buscando botón de editar...');
    
    const editSelectors = [
      '.btn-edit',
      'button[class*="edit"]',
      'button:contains("Editar")',
      'button:contains("Edit")',
      '[class*="edit"]',
      'button'
    ];
    
    let editButton = null;
    for (const selector of editSelectors) {
      try {
        if (selector.includes(':contains')) {
          // Para selectores con :contains, usar evaluate
          editButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => 
              btn.textContent.toLowerCase().includes('editar') || 
              btn.textContent.toLowerCase().includes('edit')
            );
          });
          if (editButton && await editButton.asElement()) {
            console.log(`✅ Botón de editar encontrado con texto`);
            break;
          }
        } else {
          const element = await page.$(selector);
          if (element) {
            console.log(`✅ Botón de editar encontrado con selector: ${selector}`);
            editButton = element;
            break;
          }
        }
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }
    
    if (editButton) {
      console.log('🎯 Haciendo click en el botón de editar...');
      await editButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const finalUrl = page.url();
      console.log(`🔗 URL final después del click en editar: ${finalUrl}`);
      
      if (finalUrl.includes('/edit') || finalUrl.includes('edit')) {
        console.log('🎉 ¡El botón de editar funciona correctamente! Navegó a la página de edición.');
      } else {
        console.log('❌ El botón no navegó a una página de edición.');
      }
    } else {
      console.log('❌ No se encontró el botón de editar');
      
      // Listar todos los botones disponibles para debug
      const allButtons = await page.$$eval('button', buttons => 
        buttons.map(btn => ({
          text: btn.textContent.trim(),
          className: btn.className,
          id: btn.id
        }))
      );
      console.log('🔍 Botones disponibles en la página:', allButtons);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    if (page) {
      console.log('🔍 Manteniendo navegador abierto por 15 segundos para inspección...');
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
    await browser.close();
  }
}

testEditButtonRobust();