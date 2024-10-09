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

/**
 * Rotta per ottenere la classifica dei giocatori.
 *
 * Questa rotta restituisce la classifica dei giocatori in base al punteggio totale. È possibile specificare un parametro `order` (asc o desc) per ordinare la classifica in ordine crescente o decrescente.
 *
 * @route GET /classifica
 * @queryparam {string} [order=asc] - Parametro opzionale per specificare l'ordine della classifica. Può essere "asc" (crescente, di default) o "desc" (decrescente).
 * @access Pubblica - Non richiede autenticazione.
 * @returns {Object} - Ritorna la classifica dei giocatori ordinata per punteggio.
 * @throws {HttpException} - Restituisce 500 per errori interni.
 */
router.get('/ranking', GameStatusController.classificaGiocatori);

/**
 * Rotta per ottenere un certificato in formato PDF che attesti la vittoria in una data partita.
 *
 * @route GET /certificato-vittoria/:id_partita
 * @param {number} id_partita - L'ID della partita per cui generare il certificato.
 * @returns {application/pdf} - Restituisce un certificato in formato PDF.
 */
router.get('/win-certify/:id_partita', GameStatusController.getCertificatoVittoria);


// Rotta per verificare l'elenco delle partite giocate con filtro opzionale per data
router.get('/partite', authenticateJWT, GameStatusController.listaPartite);

export default router;