import { Request, Response, NextFunction } from 'express';
import { creaPartita } from '../services/gameService';  // Importa il servizio di creazione partita per giocatori
import { startGameIA } from '../services/iaService'; // Importa la funzione per iniziare la partita contro l'IA
import HttpException from '../helpers/errorHandler'; // Importa la classe per gestire le eccezioni personalizzate

class GameController {
    // Metodo per creare una nuova partita
    public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Verifica che `req.user` sia presente e che abbia l'id del giocatore
            if (!req.user || !req.user.id_giocatore) {
                throw new HttpException(401, 'Utente non autenticato o id_giocatore mancante');
            }

            // Estrai i dati necessari dalla richiesta
            const { id_giocatore } = req.user!;
            const { livello_IA, id_giocatore2, tipo } = req.body;

            // Se `livello_IA` è presente, significa che si gioca contro l'IA
            if (livello_IA) {
                // Verifica che livello_IA sia valido
                if (!['facile', 'normale', 'difficile', 'estrema'].includes(livello_IA)) {
                    throw new HttpException(400, 'Livello IA non valido');
                }

                // Assicurati che `id_giocatore2` sia null quando si gioca contro l'IA
                if (id_giocatore2) {
                    throw new HttpException(400, 'Non è possibile fornire id_giocatore2 quando si gioca contro l\'IA');
                }

                // Inizia una nuova partita contro l'IA
                const result = await startGameIA(id_giocatore, livello_IA);
                res.status(201).json({ message: 'Partita contro IA avviata con successo', result });
            } else {
                // Se si gioca contro un altro giocatore, verifica che `id_giocatore2` sia fornito
                if (!id_giocatore2) {
                    throw new HttpException(400, 'id_giocatore2 deve essere fornito per una partita contro un altro giocatore');
                }

                // Usa il servizio per creare la partita, passandogli i dati necessari
                const result = await creaPartita(id_giocatore, id_giocatore2, tipo);

                // Risposta di successo con la partita creata e eventuali dettagli (es. mossa IA)
                res.status(201).json({ message: 'Partita creata con successo', result });
            }
        } catch (error) {
            // Gestione degli errori tramite il middleware di gestione eccezioni
            next(error);
        }
    }
}

export default GameController;