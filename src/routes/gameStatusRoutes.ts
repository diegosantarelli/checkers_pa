import { Router } from 'express';
import GameStatusController from '../controllers/gameStatusController';
import { authenticateJWT } from '../middleware/auth';

/**
 * @module GameStatusRoutes
 * @description Router per la gestione delle operazioni sullo stato delle partite. Include rotte protette tramite JWT
 * per la valutazione dello stato della partita, abbandono partita, classifica giocatori, certificato di vittoria,
 * e la lista delle partite giocate.
 */
const router = Router(); //nuova istanza di Router (agisce come una sotto-applicazione collegabile all'applicazione Express)

/**
 * @route PUT /check-status/:id_partita
 * @description Rotta per valutare lo stato della partita.
 * Permette di ottenere lo stato attuale di una partita (in corso, completata, abbandonata).
 *
 * @param {number} id_partita - L'ID della partita da valutare.
 * @access Protetta - Richiede autenticazione tramite JWT.
 *
 * @returns {Object} - Ritorna lo stato della partita.
 *
 * @throws {HttpException} - Restituisce 404 se la partita non viene trovata, 500 per errori interni.
 */
router.put('/check-status/:id_partita', authenticateJWT, GameStatusController.evaluateGame);

/**
 * @route PUT /abandon-game/:id_partita
 * @description Rotta per abbandonare una partita.
 * Permette a un giocatore di abbandonare la partita, con penalità per il giocatore che abbandona e punti bonus per
 * l'avversario.
 *
 * @param {number} id_partita - L'ID della partita da abbandonare.
 * @access Protetta - Richiede autenticazione tramite JWT.
 *
 * @returns {Object} - Ritorna il risultato dell'abbandono della partita.
 *
 * @throws {HttpException} - Restituisce 404 se la partita non viene trovata,
 * 403 se il giocatore non è autorizzato ad abbandonare, o 500 per errori interni.
 */
router.put('/abandon-game/:id_partita', authenticateJWT, GameStatusController.abandonGame);

/**
 * @route GET /ranking
 * @description Rotta per ottenere la classifica dei giocatori.
 * Restituisce la classifica dei giocatori ordinata per punteggio totale.
 * Si può specificare il parametro `order` per definire l'ordinamento (ascendente o discendente).
 *
 * @queryparam {string} [order=asc] - Parametro opzionale per specificare l'ordine della classifica.
 * Può essere "asc" (crescente, di default) o "desc" (decrescente).
 * @access Pubblica - Non richiede autenticazione.
 *
 * @returns {Object} - Ritorna la classifica dei giocatori ordinata per punteggio.
 *
 * @throws {HttpException} - Restituisce 500 per errori interni.
 */
router.get('/ranking', GameStatusController.playersRanking);

/**
 * @route GET /win-certify/:id_partita
 * @description Rotta per ottenere un certificato di vittoria in formato PDF per una data partita.
 * Restituisce un certificato che attesta la vittoria di un giocatore in una partita.
 *
 * @param {number} id_partita - L'ID della partita per cui generare il certificato.
 * @access Protetta - Richiede autenticazione tramite JWT.
 *
 * @returns {application/pdf} - Restituisce il certificato in formato PDF.
 */
router.get('/win-certify/:id_partita', authenticateJWT, GameStatusController.getVictoryCertify);

/**
 * @route GET /match-list
 * @description Rotta per ottenere l'elenco delle partite giocate da un giocatore autenticato, con filtro opzionale per
 * la data di inizio.
 *
 * @queryparam {string} [startDate] - Parametro opzionale per filtrare le partite iniziate dopo una certa data.
 * @access Protetta - Richiede autenticazione tramite JWT.
 *
 * @returns {Object} - Ritorna un elenco delle partite giocate dal giocatore autenticato.
 *
 * @throws {HttpException} - Restituisce 500 per errori interni.
 */
router.get('/match-list', authenticateJWT, GameStatusController.getMatchList);

export default router;
