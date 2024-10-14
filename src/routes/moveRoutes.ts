import express from 'express';
import moveController from '../controllers/moveController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /move
 * @description Rotta per effettuare una mossa nel gioco.
 * Permette a un giocatore autenticato di effettuare una mossa durante una partita.
 * La logica della mossa viene gestita dal controller `moveController.move`.
 *
 * @middleware authenticateJWT - Middleware che autentica l'utente tramite JWT.
 *
 * @returns {Promise<void>} - Restituisce lo stato aggiornato della partita dopo la mossa effettuata.
 *
 * @throws {HttpException} - Restituisce 401 se l'utente non è autenticato, 404 se la partita non viene trovata,
 * o 500 per errori interni.
 */
router.post('/move', authenticateJWT, moveController.move);

/**
 * @route GET /move/:id_partita/export
 * @description Rotta per esportare lo storico delle mosse di una partita.
 * Supporta i formati JSON e PDF. Il formato può essere specificato tramite il parametro `format` nella query.
 *
 * @param {number} id_partita - L'ID della partita di cui esportare lo storico delle mosse.
 * @queryparam {string} [format=json] - Parametro opzionale per specificare il formato di esportazione.
 * Può essere "json" o "pdf".
 * @middleware authenticateJWT - Middleware che autentica l'utente tramite JWT.
 *
 * @returns {Promise<void>} - Restituisce lo storico delle mosse della partita nel formato richiesto.
 *
 * @throws {HttpException} - Restituisce 404 se la partita non viene trovata, 500 per errori interni,
 * o un errore se il formato non è supportato.
 */
router.get('/move/:id_partita/export', authenticateJWT, moveController.exportMoveHistory);

export default router;
