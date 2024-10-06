import { Router } from 'express';
import GameStatusController from '../controllers/gameStatusController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Rotta per valutare lo stato della partita
router.put('/verifica-stato/:id_partita', authenticateJWT, GameStatusController.valutaPartita);

// Rotta per abbandonare una partita
router.put('/abbandona-partita/:id_partita', authenticateJWT, GameStatusController.abbandonaPartita);

export default router;