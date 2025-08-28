// ... existing code ...
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, Prisma } from '@prisma/client'; // Add Prisma here

const prisma = new PrismaClient();

export const protect: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; [key: string]: any };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.status !== 'active') { 
        console.error('🚫 Error en la verificación del token: Usuario no encontrado o inactivo con ID:', decoded.id);
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado o inactivo' });
      }

      const { password, ...userWithoutPassword } = user;
      // Assign the Prisma user object (without password) to req.user.
      // The type augmentation will expect PrismaUserProfile.
      // Prisma's User type (minus password) should be assignable to PrismaUserProfile.
      req.user = userWithoutPassword; 
      next();
    } catch (error) {
// ... existing code ...
export const authorize = (roles: Prisma.Role | Prisma.Role[]): RequestHandler => { // Use Prisma.Role
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || typeof req.user.role === 'undefined') { 
      return res.status(403).json({ message: 'Usuario no autenticado o sin rol asignado' });
    }

    const userRole: Prisma.Role = req.user.role; // Use Prisma.Role
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
  };
};