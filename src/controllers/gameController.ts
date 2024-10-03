import { Request, Response, NextFunction } from 'express';
import { creaPartita } from '../services/gameService';  // Importa il servizio di creazione partita
import HttpException from '../helpers/errorHandler';

class GameController {
    // Metodo per creare una nuova partita
    public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Estrai i dati necessari dalla richiesta
            const { id_giocatore } = req.user!; // Verifica che `req.user` sia impostato correttamente dopo l'autenticazione
            const { livello_IA, id_giocatore2 } = req.body;  // Estrai `livello_IA` e `id_giocatore2` dal corpo della richiesta

            // Usa il servizio per creare la partita, passandogli i dati necessari
            const result = await creaPartita(id_giocatore, livello_IA ? null : id_giocatore2, livello_IA);

            // Risposta di successo con la partita creata e eventuali dettagli (es. mossa IA)
            res.status(201).json({ message: 'Partita creata con successo', result });
        } catch (error) {
            // Gestione degli errori tramite il middleware di gestione eccezioni
            next(error);
        }
    }
}

export default GameController;