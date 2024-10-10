import { Router } from 'express';
import AdminController from '../controllers/adminController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route PUT /admin/recharge
 * @description Rotta protetta per ricaricare il credito di un utente.
 * Questa rotta può essere utilizzata solo dagli utenti con il ruolo di "admin".
 *
 * @middleware authenticateJWT - Autentica l'utente tramite token JWT.
 * @middleware isAdmin - Verifica che l'utente autenticato abbia il ruolo di admin.
 *
 * @function AdminController.creditRecharge - Metodo del controller che gestisce la logica di ricarica del credito.
 *
 * @returns {object} - Restituisce un oggetto JSON con il messaggio di successo o un errore.
 */
router.put('/recharge', authenticateJWT, isAdmin, AdminController.creditRecharge);

export default router;
