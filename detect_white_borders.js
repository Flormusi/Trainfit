// Script mejorado para detectar bordes blancos
console.log('🔍 DETECTANDO BORDES BLANCOS...');

function analyzeElement(element) {
  const computedStyle = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  return {
    element: element,
    tagName: element.tagName,
    className: element.className,
    id: element.id,
    border: computedStyle.border,
    borderWidth: computedStyle.borderWidth,
    borderStyle: computedStyle.borderStyle,
    borderColor: computedStyle.borderColor,
    borderTop: computedStyle.borderTop,
    borderRight: computedStyle.borderRight,
    borderBottom: computedStyle.borderBottom,
    borderLeft: computedStyle.borderLeft,
    boxShadow: computedStyle.boxShadow,
    outline: computedStyle.outline,
    outlineWidth: computedStyle.outlineWidth,
    outlineStyle: computedStyle.outlineStyle,
    outlineColor: computedStyle.outlineColor,
    backgroundColor: computedStyle.backgroundColor,
    position: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  };
}

// Buscar elementos específicos que podrían tener bordes
const selectors = [
  '.stat-card',
  '.client-card', 
  '.action-btn',
  '.stats-section',
  '.client-grid',
  '.client-info',
  '.client-actions',
  '.membership-badge',
  'button',
  'div',
  '*'
];

console.log('📊 ANALIZANDO ELEMENTOS ESPECÍFICOS:');

selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    console.log(`\n--- ${selector} (${elements.length} elementos) ---`);
    
    elements.forEach((element, index) => {
      const analysis = analyzeElement(element);
      
      // Verificar si tiene algún tipo de borde visible
      const hasBorder = analysis.borderWidth !== '0px' && analysis.borderStyle !== 'none';
      const hasBoxShadow = analysis.boxShadow !== 'none';
      const hasOutline = analysis.outlineWidth !== '0px' && analysis.outlineStyle !== 'none';
      
      if (hasBorder || hasBoxShadow || hasOutline) {
        console.log(`🚨 ELEMENTO ${index} CON BORDES/SOMBRAS:`, {
          selector: selector,
          element: element,
          className: analysis.className,
          id: analysis.id,
          border: analysis.border,
          boxShadow: analysis.boxShadow,
          outline: analysis.outline,
          position: analysis.position
        });
        
        // Resaltar el elemento en la página
        element.style.outline = '3px solid red';
        element.style.outlineOffset = '2px';
      }
    });
  }
});

// Buscar elementos con colores blancos o claros que podrían parecer bordes
console.log('\n🎨 BUSCANDO ELEMENTOS CON COLORES BLANCOS/CLAROS:');

const allElements = document.querySelectorAll('*');
allElements.forEach((element, index) => {
  const style = window.getComputedStyle(element);
  const bgColor = style.backgroundColor;
  const borderColor = style.borderColor;
  
  // Verificar colores blancos o claros
  if (bgColor.includes('255, 255, 255') || bgColor.includes('white') || 
      borderColor.includes('255, 255, 255') || borderColor.includes('white')) {
    console.log(`⚪ ELEMENTO CON COLOR BLANCO ${index}:`, {
      element: element,
      className: element.className,
      backgroundColor: bgColor,
      borderColor: borderColor,
      position: element.getBoundingClientRect()
    });
  }
});

console.log('\n✅ ANÁLISIS COMPLETADO. Revisa los elementos resaltados en rojo.');