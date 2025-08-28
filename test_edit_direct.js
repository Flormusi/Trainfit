const puppeteer = require('puppeteer');

async function testEditButtonDirect() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  let page;
  
  try {
    page = await browser.newPage();
    
    console.log('🚀 Iniciando prueba directa del botón de editar rutina...');
    
    // Ir directamente a la URL que vimos en las imágenes
    // Basándome en las imágenes, parece que hay una página de progreso del cliente
    await page.goto('http://localhost:5174/login');
    
    console.log('📄 Página de login cargada');
    
    // Esperar a que aparezcan los campos
    await page.waitForSelector('input[name="email"]');
    await page.waitForSelector('input[name="password"]');
    
    console.log('📝 Rellenando formulario de login...');
    
    // Rellenar formulario
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      
      if (emailInput) emailInput.value = 'test@trainfit.com';
      if (passwordInput) passwordInput.value = 'test123';
    });
    
    // Hacer click en submit
    await page.click('button[type="submit"]');
    
    console.log('🔄 Esperando redirección...');
    
    // Esperar a que cambie la URL
    await page.waitForFunction(
      () => !window.location.href.includes('/login'),
      { timeout: 10000 }
    );
    
    console.log(`🔗 URL después del login: ${page.url()}`);
    
    // Esperar un poco para que la página se cargue
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Tomar una captura de pantalla para ver qué hay en la página
    await page.screenshot({ path: 'dashboard_screenshot.png', fullPage: true });
    console.log('📸 Captura de pantalla guardada como dashboard_screenshot.png');
    
    // Obtener el HTML de la página para análisis
    const pageContent = await page.content();
    console.log('📄 Longitud del contenido HTML:', pageContent.length);
    
    // Buscar elementos que contengan "cliente" o "rutina"
    const relevantElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const relevant = [];
      
      for (let element of allElements) {
        const text = element.textContent || '';
        const className = element.className || '';
        
        if (text.toLowerCase().includes('cliente') || 
            text.toLowerCase().includes('rutina') ||
            text.toLowerCase().includes('editar') ||
            className.toLowerCase().includes('client') ||
            className.toLowerCase().includes('routine') ||
            className.toLowerCase().includes('edit')) {
          relevant.push({
            tagName: element.tagName,
            className: className,
            text: text.substring(0, 100),
            id: element.id
          });
        }
      }
      
      return relevant;
    });
    
    console.log('🔍 Elementos relevantes encontrados:', relevantElements.length);
    relevantElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} - ${el.className} - "${el.text}"`);
    });
    
    // Buscar específicamente botones
    const buttons = await page.evaluate(() => {
      const allButtons = document.querySelectorAll('button, a, [role="button"]');
      return Array.from(allButtons).map(btn => ({
        tagName: btn.tagName,
        text: btn.textContent.trim(),
        className: btn.className,
        href: btn.href || '',
        onclick: btn.onclick ? btn.onclick.toString() : ''
      }));
    });
    
    console.log('🔘 Botones encontrados:', buttons.length);
    buttons.forEach((btn, index) => {
      console.log(`${index + 1}. ${btn.tagName} - "${btn.text}" - ${btn.className}`);
    });
    
    // Intentar encontrar y hacer click en un botón que parezca llevar a clientes
    const clientButton = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      for (let btn of buttons) {
        const text = btn.textContent.toLowerCase();
        if (text.includes('cliente') || text.includes('client') || text.includes('ver')) {
          return btn;
        }
      }
      return null;
    });
    
    if (clientButton) {
      console.log('🎯 Encontrado botón relacionado con clientes, haciendo click...');
      await page.evaluate(btn => btn.click(), clientButton);
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log(`🔗 URL después del click: ${page.url()}`);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    if (page) {
      console.log('🔍 Manteniendo navegador abierto por 20 segundos para inspección manual...');
      await new Promise(resolve => setTimeout(resolve, 20000));
    }
    await browser.close();
  }
}

testEditButtonDirect();