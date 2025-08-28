import { User as PrismaUser, Role } from '@prisma/client'; // Importar Role directamente

declare global {
  namespace Express {
    interface Request {
      user?: Pick<PrismaUser, 'id'> & {
        role: Role; // Usar Role directamente
      };
    }
  }
}

export {};