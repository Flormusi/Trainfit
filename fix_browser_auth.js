// Script para configurar autenticación en el navegador
// Ejecutar este código en la consola del navegador (F12)

console.log('🔧 Configurando autenticación en el navegador...');

// Token válido del entrenador de prueba
const trainerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZG04aHVqdjAwMDBmNWNxNXVmeXhmcjgiLCJpYXQiOjE3NTkyNzMwMDIsImV4cCI6MTc1OTg3NzgwMn0.rhGEfwm8lJgH1euFBNDi3XeSk98m3fni1Qg9f0rd5-c';

// Datos del usuario entrenador
const trainerUser = {
  id: 'cmdm8hujv0000f5cq5ufyxfr8',
  email: 'test@trainfit.com',
  role: 'TRAINER',
  hasCompletedOnboarding: true, // Cambiado a true para evitar redirección
  name: 'Usuario de Prueba'
};

// Configurar localStorage
localStorage.setItem('token', trainerToken);
localStorage.setItem('user', JSON.stringify(trainerUser));

console.log('✅ Token configurado:', localStorage.getItem('token') ? 'SÍ' : 'NO');
console.log('✅ Usuario configurado:', localStorage.getItem('user') ? 'SÍ' : 'NO');

// Verificar configuración
console.log('📋 Verificación:');
console.log('- Token:', localStorage.getItem('token').substring(0, 50) + '...');
console.log('- Usuario:', JSON.parse(localStorage.getItem('user')));

console.log('🔄 Recargando página en 2 segundos...');
setTimeout(() => {
  window.location.reload();
}, 2000);