import { Router } from 'express';
import AdminController from '../controllers/adminController';
import { authenticateJWT, isAdmin } from '../middleware/auth'; // Importa entrambi i middleware

const router = Router();

// Applica prima authenticateJWT, poi isAdmin per controllare se l'utente è admin
router.put('/recharge', authenticateJWT, isAdmin, AdminController.creditRecharge);

export default router;
