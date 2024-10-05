import { Request, Response, NextFunction } from 'express';
import { creaPartita } from '../services/gameService';
import HttpException from "../helpers/errorHandler";

class GameController {
    public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.id_giocatore) {
                throw new HttpException(401, 'Utente non autenticato o id_giocatore mancante');
            }

            const { id_giocatore } = req.user!;
            const { email_giocatore2, tipo, livello_IA } = req.body;

            // Determina il tipo di partita da creare
            const result = await creaPartita(id_giocatore, email_giocatore2, tipo, livello_IA);

            // Usa il tipo di guardia per verificare il tipo di `result`
            if ('id_giocatore2' in result.data) {
                // Risultato PvP
                res.status(201).json({
                    success: true,
                    statusCode: 201,
                    message: "Partita PvP creata con successo",
                    data: {
                        id_partita: result.data.id_partita,
                        id_giocatore1: result.data.id_giocatore1,
                        id_giocatore2: result.data.id_giocatore2,
                        stato: result.data.stato,
                        data_inizio: result.data.data_inizio,
                    }
                });
            } else {
                // Risultato PvAI
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: "Partita contro IA creata con successo",
                    data: {
                        id_partita: result.data.id_partita,
                        stato: result.data.stato,
                        id_giocatore1: result.data.id_giocatore1,
                        data_inizio: result.data.data_inizio, // Aggiungi data_inizio
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

export default GameController;