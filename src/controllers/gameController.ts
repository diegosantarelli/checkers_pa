import { Request, Response, NextFunction } from 'express';
import { creaPartita } from '../services/gameService';
import HttpException from "../helpers/errorHandler"; // Importa il nuovo servizio

class GameController {
    public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.id_giocatore) {
                throw new HttpException(401, 'Utente non autenticato o id_giocatore mancante');
            }

            const { id_giocatore } = req.user!;
            const { id_giocatore2, tipo, livello_IA } = req.body; // Assicurati di ricevere livello_IA

            const result = await creaPartita(id_giocatore, id_giocatore2, tipo, livello_IA);

            // Controlla se il risultato è una partita PvP
            if ('id_partita' in result.data) {
                res.status(201).json({
                    success: true,
                    statusCode: 201,
                    message: "Game created successfully",
                    data: {
                        id_partita: result.data.id_partita,
                        id_giocatore1: result.data.id_giocatore1,
                        id_giocatore2: result.data.id_giocatore2,
                        difficolta: result.data.difficolta,
                        stato: result.data.stato,
                        data_inizio: result.data.data_inizio,
                    }
                });
            }
            // Controlla se il risultato è una partita PvAI
            else if ('stato' in result.data) {
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: "AI Game started successfully",
                    data: {
                        stato: result.data.stato,
                        mosse: result.data.mosse,
                        tavola: result.data.tavola,
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

export default GameController;