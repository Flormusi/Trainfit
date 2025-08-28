const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function testApiResponse() {
  try {
    const trainerId = 'cmbh8k2h00000f5z8kprejtsp';
    
    console.log('🧪 Simulando respuesta de la API getTrainerClients...');
    
    // Exactamente la misma consulta que en el controlador
    const clients = await prisma.user.findMany({
      where: {
        role: Role.CLIENT,
        trainersAsClient: {
          some: {
            trainerId: trainerId
          }
        }
      },
      include: {
        clientProfile: true,
        assignedRoutines: {
          where: {
            trainerId: trainerId
          }
        },
        assignedNutritionPlans: {
          where: {
            trainerId: trainerId
          }
        }
      }
    });
    
    console.log('\n📤 Respuesta de la API (JSON):');
    console.log(JSON.stringify(clients, null, 2));
    
    console.log('\n🔍 Análisis de los datos:');
    console.log('Número de clientes:', clients.length);
    
    if (clients.length > 0) {
      clients.forEach((client, index) => {
        console.log(`\nCliente ${index + 1}:`);
        console.log('  ID:', client.id);
        console.log('  Nombre:', client.name);
        console.log('  Email:', client.email);
        console.log('  Tipo de ID:', typeof client.id);
        console.log('  Longitud del ID:', client.id.length);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiResponse();