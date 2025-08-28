const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creando usuario de prueba...');
    
    // Crear contraseña hasheada
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: 'test@trainfit.com',
        password: hashedPassword,
        name: 'Usuario de Prueba',
        role: 'TRAINER',
        hasCompletedOnboarding: false
      }
    });
    
    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log('   Email: test@trainfit.com');
    console.log('   Contraseña: test123');
    console.log('   Rol: TRAINER');
    console.log('   ID:', user.id);
    
    // También crear un usuario cliente
    const existingClient = await prisma.user.findUnique({
      where: { email: 'client@trainfit.com' }
    });
    
    if (existingClient) {
      console.log('El usuario cliente de prueba ya existe. Eliminándolo...');
      await prisma.user.delete({
        where: { email: 'client@trainfit.com' }
      });
    }
    
    const clientUser = await prisma.user.create({
      data: {
        email: 'client@trainfit.com',
        password: hashedPassword,
        name: 'Cliente de Prueba',
        role: 'CLIENT',
        hasCompletedOnboarding: false
      }
    });
    
    console.log('\n✅ Usuario cliente de prueba creado exitosamente:');
    console.log('   Email: client@trainfit.com');
    console.log('   Contraseña: test123');
    console.log('   Rol: CLIENT');
    console.log('   ID:', clientUser.id);
    
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();