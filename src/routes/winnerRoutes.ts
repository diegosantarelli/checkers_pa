import { Router } from 'express';
import WinnerController from '../controllers/winnerController';
import { authenticateJWT } from '../middleware/auth'; // Middleware per l'autenticazione

const router = Router();

// Rotta per verificare le partite con il filtro per data
router.get('/verify', authenticateJWT, WinnerController.verificaPartite);

export default router;
