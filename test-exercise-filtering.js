const puppeteer = require('puppeteer');

// Función helper para esperar
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 200,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Iniciando prueba de filtrado de ejercicios por objetivo...');
    
    // Navegar directamente a la página de creación de rutinas
    console.log('🏃‍♂️ Navegando a crear rutina...');
    await page.goto('http://localhost:5173/trainer/create-routine', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Verificar si necesitamos hacer login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('📝 Realizando login...');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', 'trainer@test.com');
      await page.type('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Esperar a que se complete el login y redirija
      await wait(3000);
      
      // Navegar nuevamente a crear rutina
      await page.goto('http://localhost:5173/trainer/create-routine', { waitUntil: 'networkidle0', timeout: 15000 });
    }
    
    console.log('✅ Página de crear rutina cargada');
    
    // Esperar a que aparezcan los elementos de la página
    await wait(2000);
    
    // Verificar que la página se cargó correctamente
    const pageContent = await page.content();
    if (pageContent.includes('Crear Rutina') || pageContent.includes('Objetivo de Entrenamiento')) {
      console.log('📄 Página de creación de rutinas confirmada');
    } else {
      console.log('⚠️  Página no reconocida, continuando...');
    }
    
    // Buscar botones de objetivos de entrenamiento
    console.log('🎯 Buscando objetivos de entrenamiento...');
    
    const objectiveButtons = await page.$$('button');
    const objectives = [];
    
    for (const button of objectiveButtons) {
      const text = await button.evaluate(el => el.textContent?.trim());
      if (text && (text.includes('Fuerza') || text.includes('Hipertrofia') || text.includes('Resistencia') || text.includes('Potencia'))) {
        objectives.push({ name: text, button });
      }
    }
    
    console.log(`✅ Encontrados ${objectives.length} objetivos de entrenamiento`);
    
    if (objectives.length === 0) {
      console.log('❌ No se encontraron objetivos de entrenamiento');
      return;
    }
    
    // Probar el primer objetivo encontrado
    const firstObjective = objectives[0];
    console.log(`\n🔍 Probando objetivo: ${firstObjective.name}`);
    
    await firstObjective.button.click();
    console.log(`✅ Objetivo ${firstObjective.name} seleccionado`);
    
    // Esperar a que se actualicen los ejercicios
    await wait(3000);
    
    // Buscar el botón "Agregar Ejercicio"
    console.log('➕ Buscando botón "Agregar Ejercicio"...');
    const allButtons = await page.$$('button');
    let addExerciseButton = null;
    
    for (const button of allButtons) {
      const text = await button.evaluate(el => el.textContent?.trim());
      if (text && (text.includes('Agregar') || text.includes('Añadir') || text.includes('+'))) {
        addExerciseButton = button;
        break;
      }
    }
    
    if (addExerciseButton) {
      await addExerciseButton.click();
      console.log('✅ Botón "Agregar Ejercicio" clickeado');
      
      // Esperar a que aparezca el formulario de ejercicio
      await wait(2000);
      
      // Buscar el campo de búsqueda de ejercicios
      console.log('🔍 Buscando campo de búsqueda de ejercicios...');
      const inputs = await page.$$('input');
      let exerciseInput = null;
      
      for (const input of inputs) {
        const placeholder = await input.evaluate(el => el.placeholder?.toLowerCase());
        if (placeholder && (placeholder.includes('ejercicio') || placeholder.includes('buscar'))) {
          exerciseInput = input;
          break;
        }
      }
      
      if (exerciseInput) {
        await exerciseInput.click();
        console.log('✅ Campo de búsqueda de ejercicios activado');
        
        // Esperar a que aparezca el dropdown
        await wait(2000);
        
        // Buscar elementos del dropdown
        const dropdownSelectors = [
          '.absolute .cursor-pointer',
          '[class*="dropdown"] [class*="item"]',
          '.bg-\\[\\#2a2a2a\\] .cursor-pointer',
          'div[class*="hover:bg"]'
        ];
        
        let dropdownItems = [];
        for (const selector of dropdownSelectors) {
          try {
            dropdownItems = await page.$$(selector);
            if (dropdownItems.length > 0) {
              console.log(`✅ Encontrados ${dropdownItems.length} ejercicios usando selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Continuar con el siguiente selector
          }
        }
        
        if (dropdownItems.length > 0) {
          console.log(`🎉 ÉXITO: Se encontraron ${dropdownItems.length} ejercicios filtrados para ${firstObjective.name}`);
          
          // Mostrar algunos ejercicios encontrados
          for (let i = 0; i < Math.min(5, dropdownItems.length); i++) {
            try {
              const exerciseName = await dropdownItems[i].evaluate(el => el.textContent?.trim());
              if (exerciseName) {
                console.log(`   - ${exerciseName}`);
              }
            } catch (e) {
              console.log(`   - [Ejercicio ${i + 1}]`);
            }
          }
          
          // Probar seleccionar un ejercicio
          try {
            await dropdownItems[0].click();
            console.log('✅ Ejercicio seleccionado exitosamente');
          } catch (e) {
            console.log('⚠️  No se pudo seleccionar el ejercicio');
          }
          
        } else {
          console.log('❌ No se encontraron ejercicios en el dropdown');
          
          // Intentar escribir algo para activar la búsqueda
          await exerciseInput.type('press');
          await wait(1000);
          
          // Buscar nuevamente
          for (const selector of dropdownSelectors) {
            try {
              dropdownItems = await page.$$(selector);
              if (dropdownItems.length > 0) {
                console.log(`✅ Después de escribir, encontrados ${dropdownItems.length} ejercicios`);
                break;
              }
            } catch (e) {
              // Continuar
            }
          }
        }
        
      } else {
        console.log('❌ No se encontró el campo de búsqueda de ejercicios');
      }
      
    } else {
      console.log('❌ No se encontró el botón "Agregar Ejercicio"');
    }
    
    console.log('\n🎉 Prueba de filtrado de ejercicios completada');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  } finally {
    // Mantener el navegador abierto por un momento para inspección
    console.log('🔍 Manteniendo navegador abierto por 5 segundos para inspección...');
    await wait(5000);
    await browser.close();
  }
})();