// Script para identificar elementos con bordes
console.log('=== ELEMENTOS CON BORDES ===');

const allElements = document.querySelectorAll('*');
const elementsWithBorders = [];

allElements.forEach((element, index) => {
  const computedStyle = window.getComputedStyle(element);
  const borderWidth = computedStyle.borderWidth;
  const borderStyle = computedStyle.borderStyle;
  const borderColor = computedStyle.borderColor;
  
  // Verificar si tiene algún borde visible
  if (borderWidth !== '0px' && borderStyle !== 'none' && borderColor !== 'rgba(0, 0, 0, 0)') {
    const elementInfo = {
      element: element,
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      borderWidth: borderWidth,
      borderStyle: borderStyle,
      borderColor: borderColor,
      computedBorder: computedStyle.border
    };
    
    elementsWithBorders.push(elementInfo);
    console.log(`Elemento ${index}:`, elementInfo);
  }
});

console.log(`Total de elementos con bordes: ${elementsWithBorders.length}`);
console.log('Elementos con bordes:', elementsWithBorders);

// También verificar elementos con outline
console.log('\n=== ELEMENTOS CON OUTLINE ===');
const elementsWithOutline = [];

allElements.forEach((element, index) => {
  const computedStyle = window.getComputedStyle(element);
  const outlineWidth = computedStyle.outlineWidth;
  const outlineStyle = computedStyle.outlineStyle;
  
  if (outlineWidth !== '0px' && outlineStyle !== 'none') {
    const elementInfo = {
      element: element,
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      outlineWidth: outlineWidth,
      outlineStyle: outlineStyle,
      outlineColor: computedStyle.outlineColor
    };
    
    elementsWithOutline.push(elementInfo);
    console.log(`Elemento con outline ${index}:`, elementInfo);
  }
});

console.log(`Total de elementos con outline: ${elementsWithOutline.length}`);