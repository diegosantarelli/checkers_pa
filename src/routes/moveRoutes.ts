import express from 'express';
import moveController from '../controllers/moveController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * Rotta per effettuare una mossa nel gioco.
 *
 * @route POST /mossa
 * @middleware authenticateJWT - Middleware che autentica l'utente tramite JWT.
 * @controller moveController.move - Gestisce la logica di una mossa nel gioco.
 *
 * @description
 * Questa rotta permette a un giocatore autenticato di effettuare una mossa.
 * L'autenticazione tramite JWT è necessaria per assicurarsi che solo i giocatori autenticati
 * possano fare una mossa.
 * La logica della mossa viene gestita dal controller `moveController.move`.
 *
 * @returns {Promise<void>} - Restituisce lo stato della partita dopo aver effettuato la mossa.
 *
 * @example
 * // Esempio di richiesta JSON:
 * {
 *   "id_partita": 1,
 *   "from": "A7",
 *    "to": "E7"
 * }
 *
 * // Esempio di risposta:
 * {
 *     "success": true,
 *     "statusCode": 201,
 *     "message": "Mossa eseguita correttamente",
 *     "data": {
 *         "move": "Hai mosso un pezzo singolo di colore nero da A7 a E7. L'IA ha mosso un pezzo singolo di colore nero da F6 a B6."
 *     }
 * }
 */
router.post('/move', authenticateJWT, moveController.move);

/**
 * Rotta per esportare lo storico delle mosse di una partita.
 * Supporta i formati JSON e PDF.
 */
router.get('/move/:id_partita/export', authenticateJWT, moveController.exportMoveHistory);

export default router;
