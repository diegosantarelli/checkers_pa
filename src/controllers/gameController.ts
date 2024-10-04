import { Request, Response, NextFunction } from 'express';
import { creaPartita } from '../services/gameService';  // Importa il servizio di creazione partita
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
            const { livello_IA, id_giocatore2 } = req.body;

            // Verifica che livello_IA sia valido solo se la partita è contro IA
            if (livello_IA && !['facile', 'normale', 'difficile', 'estrema'].includes(livello_IA)) {
                throw new HttpException(400, 'Livello IA non valido');
            }

            // Se si gioca contro IA, `id_giocatore2` deve essere null, altrimenti deve essere fornito
            const giocatore2 = livello_IA ? null : id_giocatore2;

            // Verifica che `id_giocatore2` sia presente se non si gioca contro IA
            if (!livello_IA && !id_giocatore2) {
                throw new HttpException(400, 'id_giocatore2 deve essere fornito per una partita non contro IA');
            }

            // Usa il servizio per creare la partita, passandogli i dati necessari
            const result = await creaPartita(id_giocatore, giocatore2, livello_IA);

            // Risposta di successo con la partita creata e eventuali dettagli (es. mossa IA)
            res.status(201).json({ message: 'Partita creata con successo', result });
        } catch (error) {
            // Gestione degli errori tramite il middleware di gestione eccezioni
            next(error);
        }
    }
}

export default GameController;