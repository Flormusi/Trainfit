import dotenv from 'dotenv';
import app from './app';
import { PrismaClient } from '@prisma/client';
import { CronService } from './services/cronService';

dotenv.config();


const prisma = new PrismaClient();
const PORT = process.env.PORT || 5004;

// // Connect to MongoDB // Eliminar este bloque completo
// const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/trainfit';
// mongoose.connect(mongoUri)
// .then(() => console.log('✅ Connected to MongoDB'))
// .catch(err => {
// console.error('❌ MongoDB connection error:', err);
// process.exit(1); // Salir si no se puede conectar a la BD
// });

async function main() {
  // Prisma Client se conecta automáticamente basado en DATABASE_URL en .env
  // Puedes realizar una consulta simple aquí para verificar la conexión si lo deseas
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
    console.log('🔄 Starting server with cron jobs and fixed email service...');

    // Inicializar trabajos cron para recordatorios automáticos
    CronService.initializeCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL via Prisma:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Opcional: Manejo de cierre elegante para Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Cron jobs initialized successfully - Email service fixed