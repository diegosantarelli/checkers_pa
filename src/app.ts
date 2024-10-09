import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import loginRoutes from './routes/loginRoutes';
import checkerRoutes from './routes/gameRoutes';
import mossaRoutes from './routes/mossaRoutes';
import gameStatusRoutes from "./routes/gameStatusRoutes";
import adminRoutes from "./routes/AdminRoutes";

/* Carica le variabili d'ambiente da file .env */
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/* Crea un'istanza dell'applicazione Express */
const app = express();
/* Definisce la porta su cui il server sarà in esecuzione, altrimenti la 3001 se non specificato */
const port = process.env.PORT || 3001;

/**
 *  Middleware per interpretare il corpo delle richieste in formato JSON
 */
app.use(express.json());

/**
 * Rotta di prova che conferma che il server è attivo.
 *
 * @route GET /
 * @returns {string} Un messaggio di conferma che il server è attivo.
 */
app.get('/', (req, res) => {
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
 * Rotta protetta per la creazione di una partita.
 *
 * @route /game
 * @see checkerRoutes
 */
app.use('/game', checkerRoutes);

/**
 * Rotta per la validazione delle mosse in partita.
 *
 * @route /do
 * @see mossaRoutes
 */
app.use('/do', mossaRoutes);

/**
 * Rotta per ottenere lo stato attuale di una partita e gestione dell'abbandono.
 *
 * @route /partita
 * @see gameStatusRoutes
 */
app.use('/partita', gameStatusRoutes);

/**
 * Rotta per la gestione del credito dei giocatori.
 *
 * @route /admin
 * @see adminRoutes
 */

app.use('/admin', adminRoutes);

/**
 * Avvia il server Express su una porta specificata.
 *
 * @param {number|string} port - Il numero di porta su cui il server deve ascoltare.
 */
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});

/* Esporta l'istanza dell'applicazione per utilizzarla in altri moduli */
export default app;