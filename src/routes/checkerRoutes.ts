import express from 'express';
import gameController from '../controllers/gameController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Rotta protetta per creare una partita
router.post('/create', authenticateJWT, gameController.createGame);

export default router;
