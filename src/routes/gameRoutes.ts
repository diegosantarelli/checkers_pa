import { Router } from 'express';
import GameController from '../controllers/gameController';
import { authenticateJWT } from '../middleware/auth';

const router = Router(); //nuova istanza di Router (agisce come una sotto-applicazione collegabile all'applicazione Express)

/**
 * Rotta protetta per creare una partita.
 *
 * @route POST /game/create
 * @middleware authenticateJWT - Middleware che autentica il token JWT dell'utente.
 * @controller GameController.createGame - Metodo che gestisce la logica per la creazione di una partita.
 *
 * @description
 * Questa rotta permette agli utenti autenticati di creare una nuova partita.
 * Il middleware `authenticateJWT` verifica che l'utente abbia un token JWT valido.
 * Se la verifica ha successo, viene eseguita la logica di creazione della partita
 * implementata nel metodo `createGame` del `GameController`.
 */
router.post('/create', authenticateJWT, GameController.createGame);

export default router;
