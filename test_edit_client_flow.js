const puppeteer = require('puppeteer');

async function testEditClientFlow() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🚀 Iniciando prueba del flujo de edición de cliente...');
        
        // 1. Ir a la página de login
        await page.goto('http://localhost:5173/login');
        await page.waitForSelector('input[name="email"]');
        
        // 2. Hacer login
        await page.type('input[name="email"]', 'magagroca@gmail.com');
        await page.type('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        // 3. Esperar a que cargue el dashboard
        await page.waitForNavigation();
        console.log('✅ Login exitoso');
        
        // 4. Navegar al cliente específico
        const clientId = 'cmcxkgizo0002f5ljs8ubspxn';
        await page.goto(`http://localhost:5173/trainer/clients/${clientId}`);
        await page.waitForSelector('h1', { timeout: 10000 });
        console.log('✅ Dashboard del cliente cargado');
        
        // 5. Hacer clic en el botón de editar cliente
        await page.waitForSelector('button:has-text("Editar Cliente")', { timeout: 5000 });
        await page.click('button:has-text("Editar Cliente")');
        
        // 6. Esperar a que cargue la página de edición
        await page.waitForNavigation();
        await page.waitForSelector('input[name="name"]');
        console.log('✅ Página de edición cargada');
        
        // 7. Modificar el nombre del cliente
        await page.click('input[name="name"]', { clickCount: 3 });
        const newName = `Maria Florencia Musitani - Editado ${Date.now()}`;
        await page.type('input[name="name"]', newName);
        
        // 8. Guardar los cambios
        await page.click('button[type="submit"]');
        console.log('✅ Formulario enviado');
        
        // 9. Esperar la redirección y verificar que se actualicen los datos
        await page.waitForNavigation({ timeout: 10000 });
        
        // 10. Verificar que estamos en la página correcta del cliente
        const currentUrl = page.url();
        console.log('📍 URL actual:', currentUrl);
        
        if (currentUrl.includes(`/trainer/clients/${clientId}`)) {
            console.log('✅ Redirección correcta al dashboard del cliente');
            
            // 11. Verificar que el nombre se actualizó
            await page.waitForSelector('h1', { timeout: 5000 });
            const displayedName = await page.$eval('h1', el => el.textContent);
            
            if (displayedName && displayedName.includes('Editado')) {
                console.log('✅ Datos actualizados correctamente en el dashboard');
                console.log('📝 Nombre mostrado:', displayedName);
            } else {
                console.log('❌ Los datos no se actualizaron en el dashboard');
                console.log('📝 Nombre mostrado:', displayedName);
            }
        } else {
            console.log('❌ Redirección incorrecta');
            console.log('📍 Se esperaba:', `/trainer/clients/${clientId}`);
            console.log('📍 Se obtuvo:', currentUrl);
        }
        
        console.log('🎉 Prueba completada');
        
    } catch (error) {
        console.error('💥 Error durante la prueba:', error);
    }
    
    // Mantener el navegador abierto para inspección manual
    console.log('🔍 Navegador mantenido abierto para inspección manual...');
    // await browser.close();
}

testEditClientFlow();