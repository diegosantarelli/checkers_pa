import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import loginRoutes from './routes/loginRoutes';
import gameRoutes from './routes/gameRoutes';
import moveRoutes from './routes/moveRoutes';
import gameStatusRoutes from './routes/gameStatusRoutes';
import adminRoutes from './routes/AdminRoutes';
import ErrorFactory from './factories/errorFactory';

/**
 * @file app.ts
 * @description File principale che avvia l'applicazione Express.
 */

/** Carica le variabili d'ambiente da file .env */
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Crea un'istanza dell'applicazione Express.
 *
 * @constant {express.Application} app
 */
const app = express();

/**
 * Definisce la porta su cui il server sarà in esecuzione.
 * Utilizza il valore della variabile d'ambiente `PORT` oppure, in assenza, utilizza la porta 3001.
 *
 * @constant {number|string} port
 */
const port = process.env.PORT || 3001;

/**
 * Middleware per interpretare il corpo delle richieste in formato JSON.
 * Utilizza `express.json()` per il parsing automatico dei payload JSON nelle richieste.
 */
app.use(express.json());

/**
 * Rotta di prova che conferma che il server è attivo.
 *
 * @route GET /
 * @returns {string} Un messaggio di conferma che il server è attivo.
 */
app.get('/', (req: Request, res: Response) => {
    res.send('Ciao, il server è attivo!');
});

/**
 * Rotta di login.
 *
 * @route /login
 * @see loginRoutes
 */
app.use('/login', loginRoutes);

/**
 * Rotta protetta per la creazione di nuove partite.
 *
 * @route /game
 * @see checkerRoutes
 */
app.use('/game', gameRoutes);

/**
 * Rotta per la gestione delle mosse in partita.
 *
 * @route /do
 * @see mossaRoutes
 */
app.use('/do', moveRoutes);

/**
 * Rotta per ottenere informazioni riguardanti le partite.
 * In particolare consente di:
 *  - valutare lo stato di una partita.
 *  - abbandonare una partita.
 *  - ottenere la classifica dei giocatori.
 *  - ottenere l'elenco delle partite giocate eventualmente filtrando sulla data di inizio.
 *
 * @route /game-status
 * @see gameStatusRoutes
 */
app.use('/game-status', gameStatusRoutes);

/**
 * Rotta per la gestione del credito dei giocatori.
 *
 * @route /admin
 * @see adminRoutes
 */
app.use('/admin', adminRoutes);

/**
 * Middleware per gestire le rotte non trovate.
 * Se l'utente tenta di accedere a una rotta non esistente, viene restituito un errore 404.
 *
 * @param {Request} req - L'oggetto richiesta Express.
 * @param {Response} res - L'oggetto risposta Express.
 * @param {NextFunction} next - La funzione di callback per passare il controllo al middleware successivo.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = ErrorFactory.createError('NOT_FOUND', `La rotta ${req.originalUrl} non esiste.`);
    next(error); // Passa l'errore al middleware di gestione degli errori
});

/**
 * Avvia il server Express su una porta specificata.
 *
 * @param {number|string} port - Il numero di porta su cui il server deve ascoltare.
 */
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});

/**
 * Esporta l'istanza dell'applicazione per utilizzarla in altri moduli.
 *
 * @exports app
 */
export default app;
