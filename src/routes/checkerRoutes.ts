import express, { Request, Response } from 'express';
import Partita from '../models/Partita';
import Giocatore from "../models/Giocatore";
import { authenticateToken } from '../middleware/auth';
import Draughts from 'rapid-draughts';  // Integrazione con la libreria Rapid-Draughts
import Mossa from "../models/Mossa";

const router = express.Router();

// Rotta per creare una nuova partita
router.post('/games', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    const { gameType, difficultyLevel, id_giocatore2 } = req.body;

    // Verifica che req.user esista e contenga l'ID
    let id_giocatore1: string | undefined;

    if (typeof req.user === 'object' && req.user !== null && 'id' in req.user) {
        id_giocatore1 = req.user.id;
    } else {
        res.status(401).json({ message: 'Utente non autenticato o token non valido.' });
        return;
    }

    try {
        // Recupera il giocatore 1 (utente autenticato)
        const giocatore1 = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore1 || giocatore1.token_residuo < 0.45) {
            res.status(401).json({ message: 'Token insufficienti per creare la partita.' });
            return;
        }

        let giocatore2 = null;
        if (gameType === 'PvP') {
            // Verifica che il giocatore 2 esista
            giocatore2 = await Giocatore.findByPk(id_giocatore2);
            if (!giocatore2) {
                res.status(404).json({ message: 'Giocatore 2 non trovato.' });
                return;
            }
        }

        // Inizializza la logica del gioco con rapid-draughts
        const game = new Draughts();
        const initialBoard = game.getBoard();  // Recupera lo stato iniziale della scacchiera

        // Crea la partita nel database
        const newGame = await Partita.create({
            id_giocatore1,
            id_giocatore2: gameType === 'PvAI' ? null : giocatore2?.id,
            stato: 'in corso',
            data_inizio: new Date(),
        });

        // Scala i token del giocatore 1 (0.45 token all'atto della creazione della partita)
        await giocatore1.update({ token_residuo: giocatore1.token_residuo - 0.45 });

        // Se la partita è contro l'IA, prepara la logica per l'intelligenza artificiale
        if (gameType === 'PvAI') {
            const aiDifficulty = difficultyLevel || 1;  // Imposta un livello di difficoltà predefinito
            const aiMove = game.getBestMove(aiDifficulty);  // Logica per il calcolo della mossa dell'IA

            // Salva la mossa dell'IA come una Mossa nel database
            await Mossa.create({
                numero_mossa: 1,
                tavola: aiMove.board,  // Stato della scacchiera dopo la mossa dell'IA
                id_partita: newGame.id,
                id_giocatore: id_giocatore1,
            });
        }

        // Rispondi con i dettagli della partita
        res.status(201).json({
            message: 'Partita creata con successo',
            gameId: newGame.id,
            initialBoard
        });
    } catch (error) {
        res.status(500).json({ message: 'Errore nella creazione della partita.', error });
    }
});


export default router;
