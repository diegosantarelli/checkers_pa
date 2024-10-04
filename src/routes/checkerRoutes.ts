import { Router } from 'express';
import GameController from '../controllers/gameController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Rotta protetta per creare una partita
router.post('/create', authenticateJWT, GameController.createGame);

export default router;