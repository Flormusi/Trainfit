const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFlorenciaRoutines() {
  try {
    console.log('🔍 Verificando rutinas para florenciamusitani@gmail.com...');
    
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: {
        email: 'florenciamusitani@gmail.com'
      },
      include: {
        assignedRoutines: {
          include: {
            exercises: true
          }
        },
        routineAssignments: {
          include: {
            routine: {
              include: {
                exercises: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', user.name, '- ID:', user.id);
    console.log('📧 Email:', user.email);
    console.log('👤 Rol:', user.role);
    
    // Rutinas directamente asignadas
    console.log('\n📋 Rutinas directamente asignadas:', user.assignedRoutines.length);
    user.assignedRoutines.forEach((routine, index) => {
      console.log(`  ${index + 1}. ${routine.name} (ID: ${routine.id})`);
      console.log(`     - Ejercicios: ${routine.exercises.length}`);
      console.log(`     - Creada: ${routine.createdAt}`);
    });
    
    // Rutinas por asignación
    console.log('\n🎯 Rutinas por asignación:', user.routineAssignments.length);
    user.routineAssignments.forEach((assignment, index) => {
      console.log(`  ${index + 1}. ${assignment.routine.name} (ID: ${assignment.routine.id})`);
      console.log(`     - Ejercicios: ${assignment.routine.exercises.length}`);
      console.log(`     - Asignada: ${assignment.createdAt}`);
      console.log(`     - Entrenador ID: ${assignment.trainerId}`);
    });
    
    // Total de rutinas
    const totalRoutines = user.assignedRoutines.length + user.routineAssignments.length;
    console.log(`\n📊 Total de rutinas disponibles: ${totalRoutines}`);
    
    if (totalRoutines === 0) {
      console.log('⚠️  El usuario no tiene rutinas asignadas');
      
      // Verificar si hay rutinas en el sistema
      const allRoutines = await prisma.routine.findMany();
      console.log(`\n🔍 Total de rutinas en el sistema: ${allRoutines.length}`);
      
      // Verificar asignaciones recientes
      const recentAssignments = await prisma.routineAssignment.findMany({
        where: {
          clientId: user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        include: {
          routine: true
        }
      });
      
      console.log(`\n📅 Asignaciones recientes para este usuario: ${recentAssignments.length}`);
      recentAssignments.forEach((assignment, index) => {
        console.log(`  ${index + 1}. ${assignment.routine.name} - ${assignment.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFlorenciaRoutines();