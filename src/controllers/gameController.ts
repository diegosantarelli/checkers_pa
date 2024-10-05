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

            // Verifica che solo uno dei due sia fornito
            if ((email_giocatore2 && livello_IA) || (!email_giocatore2 && !livello_IA)) {
                throw new HttpException(400, 'Devi specificare o l\'email del giocatore 2 oppure il livello IA.');
            }

            const result = await creaPartita(id_giocatore, email_giocatore2, tipo, livello_IA);

            if ('id_giocatore2' in result.data && result.data.id_giocatore2 !== null) {
                // PvP
                res.status(201).json({
                    success: true,
                    statusCode: 201,
                    message: "Partita PvP creata con successo",
                    data: result.data
                });
            } else {
                // PvAI
                res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: "Partita contro IA creata con successo",
                    data: result.data
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

export default GameController;