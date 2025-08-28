const puppeteer = require('puppeteer');

async function testDashboardUpdate() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Iniciando prueba de actualización del dashboard...');
    
    // 1. Ir a la página de login
    await page.goto('http://localhost:5174/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // 2. Hacer login
    await page.type('input[type="email"]', 'trainer@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 3. Esperar a que cargue el dashboard
    await page.waitForSelector('.client-card', { timeout: 10000 });
    console.log('✅ Dashboard cargado');
    
    // 4. Obtener el nombre actual del primer cliente
    const originalName = await page.evaluate(() => {
      const clientCard = document.querySelector('.client-card h3');
      return clientCard ? clientCard.textContent.trim() : null;
    });
    console.log('📝 Nombre original del cliente:', originalName);
    
    // 5. Hacer clic en el primer cliente para ir a su página de progreso
    await page.click('.client-card');
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Página de progreso del cliente cargada');
    
    // 6. Hacer clic en el botón "Editar Cliente"
    await page.waitForSelector('button:has-text("Editar Cliente")', { timeout: 5000 });
    await page.click('button:has-text("Editar Cliente")');
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    console.log('✅ Página de edición cargada');
    
    // 7. Cambiar el nombre del cliente
    const newName = `${originalName} - Actualizado ${Date.now()}`;
    await page.fill('input[name="name"]', '');
    await page.type('input[name="name"]', newName);
    console.log('📝 Nuevo nombre:', newName);
    
    // 8. Guardar los cambios
    await page.click('button[type="submit"]');
    
    // 9. Esperar el mensaje de éxito y la redirección
    await page.waitForSelector('.success-message, .alert-success', { timeout: 10000 });
    console.log('✅ Mensaje de éxito mostrado');
    
    // 10. Esperar a que se redirija al dashboard del cliente
    await page.waitForFunction(() => {
      return window.location.pathname.includes('/trainer/clients/') && 
             !window.location.pathname.includes('/edit');
    }, { timeout: 10000 });
    console.log('✅ Redirección completada');
    
    // 11. Verificar que el nombre se actualizó en el dashboard del cliente
    await page.waitForSelector('h1', { timeout: 5000 });
    const updatedNameInProgress = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : null;
    });
    console.log('📝 Nombre en página de progreso:', updatedNameInProgress);
    
    // 12. Volver al dashboard principal
    await page.click('button:has-text("Volver a Clientes"), a:has-text("Volver a Clientes")');
    await page.waitForSelector('.client-card', { timeout: 10000 });
    console.log('✅ De vuelta en el dashboard principal');
    
    // 13. Verificar que el nombre se actualizó en el dashboard principal
    await page.waitForTimeout(2000); // Dar tiempo para que se actualicen los datos
    const updatedNameInDashboard = await page.evaluate(() => {
      const clientCard = document.querySelector('.client-card h3');
      return clientCard ? clientCard.textContent.trim() : null;
    });
    console.log('📝 Nombre en dashboard principal:', updatedNameInDashboard);
    
    // 14. Verificar que los nombres coinciden
    if (updatedNameInProgress === newName && updatedNameInDashboard === newName) {
      console.log('🎉 ¡ÉXITO! El dashboard se actualizó correctamente');
      console.log('✅ Nombre original:', originalName);
      console.log('✅ Nombre actualizado:', newName);
      console.log('✅ Nombre en progreso:', updatedNameInProgress);
      console.log('✅ Nombre en dashboard:', updatedNameInDashboard);
    } else {
      console.log('❌ ERROR: El dashboard no se actualizó correctamente');
      console.log('❌ Nombre esperado:', newName);
      console.log('❌ Nombre en progreso:', updatedNameInProgress);
      console.log('❌ Nombre en dashboard:', updatedNameInDashboard);
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await browser.close();
  }
}

testDashboardUpdate();