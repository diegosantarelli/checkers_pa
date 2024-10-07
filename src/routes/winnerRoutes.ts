import { Router } from 'express';
import WinnerController from '../controllers/winnerController';
import { authenticateJWT } from '../middleware/auth'; // Middleware per l'autenticazione

const router = Router();

// Rotta per verificare l'elenco delle partite giocate con filtro opzionale per data
router.get('/partite', authenticateJWT, WinnerController.listaPartite);

export default router;