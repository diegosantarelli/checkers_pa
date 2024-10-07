import { Router } from 'express';
import GameStatusController from '../controllers/gameStatusController';
import { authenticateJWT } from '../middleware/auth';

/**
 * Router per la gestione delle operazioni sullo stato delle partite.
 *
 * @module GameStatusRoutes
 */
const router = Router();

/**
 * Rotta per valutare lo stato della partita.
 *
 * Questa rotta permette di ottenere lo stato attuale di una partita, come ad esempio se è in corso, completata o abbandonata.
 *
 * @route PUT /verifica-stato/:id_partita
 * @param {number} id_partita - L'ID della partita da valutare.
 * @access Protetta - Richiede autenticazione tramite JWT.
 * @returns {Object} - Ritorna lo stato della partita.
 * @throws {HttpException} - Restituisce 404 se la partita non viene trovata, 500 per errori interni.
 */
router.put('/verifica-stato/:id_partita', authenticateJWT, GameStatusController.valutaPartita);

/**
 * Rotta per abbandonare una partita.
 *
 * Questa rotta permette a un giocatore di abbandonare la partita, assegnando penalità al giocatore che abbandona e punti bonus all'avversario, se applicabile.
 *
 * @route PUT /abbandona-partita/:id_partita
 * @param {number} id_partita - L'ID della partita da abbandonare.
 * @access Protetta - Richiede autenticazione tramite JWT.
 * @returns {Object} - Ritorna il risultato dell'abbandono della partita.
 * @throws {HttpException} - Restituisce 404 se la partita non viene trovata, 403 se il giocatore non è autorizzato, o 500 per errori interni.
 */
router.put('/abbandona-partita/:id_partita', authenticateJWT, GameStatusController.abbandonaPartita);

export default router;