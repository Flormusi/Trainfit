// Script para verificar si los logos se cargan correctamente
console.log('🔍 Verificando logos de TrainFit...');

// Lista de logos a verificar
const logos = [
  '/images/logo-trainfit.png',
  '/images/trainfit-logo.svg',
  '/images/trainfit-logo-new.png'
];

// Función para verificar si una imagen se carga
function checkImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ ${src} - Carga exitosa`);
      resolve({ src, status: 'success', width: img.width, height: img.height });
    };
    img.onerror = () => {
      console.log(`❌ ${src} - Error al cargar`);
      resolve({ src, status: 'error' });
    };
    img.src = src;
  });
}

// Verificar todos los logos
async function checkAllLogos() {
  console.log('🚀 Iniciando verificación de logos...');
  
  for (const logo of logos) {
    const result = await checkImage(logo);
    if (result.status === 'success') {
      console.log(`📏 ${logo}: ${result.width}x${result.height}px`);
    }
  }
  
  console.log('✨ Verificación completada');
}

// Ejecutar verificación
checkAllLogos();

// También verificar errores en la consola
console.log('🔍 Verificando errores en la consola...');
const originalError = console.error;
console.error = function(...args) {
  if (args.some(arg => typeof arg === 'string' && (arg.includes('logo') || arg.includes('image') || arg.includes('404')))) {
    console.log('🚨 Error relacionado con imágenes detectado:', ...args);
  }
  originalError.apply(console, args);
};