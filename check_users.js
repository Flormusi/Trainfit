const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientProfile: {
          select: {
            age: true,
            gender: true,
            fitnessLevel: true,
            goals: true
          }
        }
      }
    });

    console.log('👥 Usuarios encontrados:', users.length);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      if (user.clientProfile) {
        console.log(`   Perfil del cliente:`);
        console.log(`   - Edad: ${user.clientProfile.age || 'No especificada'}`);
        console.log(`   - Género: ${user.clientProfile.gender || 'No especificado'}`);
        console.log(`   - Nivel de fitness: ${user.clientProfile.fitnessLevel || 'No especificado'}`);
        console.log(`   - Objetivos: ${user.clientProfile.goals || 'No especificados'}`);
      }
    });

    // Buscar entrenadores específicamente
    const trainers = users.filter(user => user.role === 'TRAINER');
    console.log(`\n🏋️ Entrenadores encontrados: ${trainers.length}`);
    
    if (trainers.length > 0) {
      console.log('\n📧 Emails de entrenadores para login:');
      trainers.forEach(trainer => {
        console.log(`- ${trainer.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();