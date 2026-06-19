import express, { RequestHandler } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client'; // 👈 Import Role enum
import { 
  createOrUpdateProfile, 
  getProfile, 
  getAssignedRoutines, 
  getAssignedWorkouts 
} from '../controllers/clientProfile.controller';
import { getClientProgress } from '../controllers/clientProgress.controller'; // 👈 Importa el controlador de progreso

const router = express.Router();

// Middleware para proteger y autorizar solo a clientes
router.use(protect);
router.use(authorize([Role.CLIENT])); // Pasando un array con el rol

// Perfil del cliente (get y create/update)
router.route('/profile')
  .get(getProfile as RequestHandler)
  .post(createOrUpdateProfile as RequestHandler)
  .put(createOrUpdateProfile as RequestHandler);

// Otras rutas del cliente
router.get('/routines', getAssignedRoutines as RequestHandler);
router.get('/workouts', getAssignedWorkouts as RequestHandler);
router.get('/progress', getClientProgress as RequestHandler);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.status(200).json({ message: '✅ clientProfile route is working!' });
});

export default router;