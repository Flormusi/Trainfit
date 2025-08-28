import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getRoutineDetailsForClient } from '../controllers/routine.controller';

const router = Router();

// Ruta de prueba sin middleware
router.get('/test', (req, res) => {
    console.log('🧪 Ruta de prueba funcionando correctamente');
    res.json({ message: 'Test route working', timestamp: new Date().toISOString() });
});

// Ruta para obtener detalles de rutina (accesible para clientes)
router.get('/:id', protect, getRoutineDetailsForClient);

export default router;