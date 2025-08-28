const puppeteer = require('puppeteer');

async function testManualFlow() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
    slowMo: 500 // Hacer todo más lento para simular usuario real
  });
  
  let page;
  
  try {
    page = await browser.newPage();
    
    console.log('🚀 Iniciando flujo manual de prueba...');
    
    // Ir a la página principal
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    console.log('📄 Página principal cargada');
    
    // Esperar un poco y tomar captura
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'step1_homepage.png', fullPage: true });
    
    // Buscar el botón de login o ir directamente a /login
    const loginButton = await page.$('a[href="/login"]');
    if (loginButton) {
      console.log('🔗 Encontrado botón de login, haciendo click...');
      await loginButton.click();
    } else {
      console.log('🔗 No se encontró botón de login, navegando directamente...');
      await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'step2_login_page.png', fullPage: true });
    console.log('📄 Página de login cargada');
    
    // Verificar que estamos en la página de login
    const currentUrl = page.url();
    console.log(`🔗 URL actual: ${currentUrl}`);
    
    if (!currentUrl.includes('/login')) {
      console.log('❌ No estamos en la página de login');
      return;
    }
    
    // Buscar los campos de entrada
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 5000 });
    await page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 5000 });
    
    console.log('📝 Campos de entrada encontrados');
    
    // Rellenar el formulario paso a paso
    const emailField = await page.$('input[name="email"], input[type="email"]');
    const passwordField = await page.$('input[name="password"], input[type="password"]');
    
    if (emailField && passwordField) {
      // Limpiar y escribir email
      await emailField.click({ clickCount: 3 });
      await emailField.type('test@trainfit.com');
      
      // Limpiar y escribir password
      await passwordField.click({ clickCount: 3 });
      await passwordField.type('test123');
      
      console.log('📝 Formulario rellenado');
      await page.screenshot({ path: 'step3_form_filled.png', fullPage: true });
      
      // Buscar y hacer click en el botón de submit
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        console.log('🎯 Haciendo click en el botón de submit...');
        await submitButton.click();
        
        // Esperar a que algo cambie
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const newUrl = page.url();
        console.log(`🔗 URL después del submit: ${newUrl}`);
        
        await page.screenshot({ path: 'step4_after_submit.png', fullPage: true });
        
        if (newUrl !== currentUrl) {
          console.log('✅ La URL cambió, el login parece haber funcionado');
          
          // Buscar elementos del dashboard
          const dashboardElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const found = [];
            
            for (let el of elements) {
              const text = el.textContent || '';
              const className = el.className || '';
              
              if (text.toLowerCase().includes('dashboard') ||
                  text.toLowerCase().includes('cliente') ||
                  text.toLowerCase().includes('rutina') ||
                  className.toLowerCase().includes('dashboard') ||
                  className.toLowerCase().includes('client')) {
                found.push({
                  tag: el.tagName,
                  text: text.substring(0, 50),
                  className: className
                });
              }
            }
            
            return found;
          });
          
          console.log('🔍 Elementos del dashboard encontrados:', dashboardElements.length);
          dashboardElements.forEach((el, i) => {
            console.log(`${i + 1}. ${el.tag} - "${el.text}" - ${el.className}`);
          });
          
        } else {
          console.log('❌ La URL no cambió, puede haber un error en el login');
          
          // Buscar mensajes de error
          const errorMessages = await page.evaluate(() => {
            const errors = document.querySelectorAll('.error, .alert, [class*="error"], [class*="alert"]');
            return Array.from(errors).map(el => el.textContent);
          });
          
          if (errorMessages.length > 0) {
            console.log('❌ Mensajes de error encontrados:', errorMessages);
          }
        }
      } else {
        console.log('❌ No se encontró el botón de submit');
      }
    } else {
      console.log('❌ No se encontraron los campos de entrada');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (page) {
      await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
    }
  } finally {
    if (page) {
      console.log('🔍 Manteniendo navegador abierto por 30 segundos para inspección manual...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    await browser.close();
  }
}

testManualFlow();