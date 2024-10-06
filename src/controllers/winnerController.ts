import { Request, Response, NextFunction } from 'express';
import WinnerService from '../services/winnerService';
import HttpException from '../helpers/errorHandler';

class WinnerController {
    public static async verificaPartite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate } = req.query;
            const id_giocatore = req.user?.id_giocatore; // Assumi che il middleware di autenticazione inserisca l'id_giocatore

            // Verifica se l'utente è autenticato
            if (!id_giocatore) {
                throw new HttpException(401, 'Autenticazione richiesta');
            }

            // Verifica le partite tramite il servizio
            const partite = await WinnerService.verificaPartite(id_giocatore, startDate as string);

            // Risposta al client
            res.status(200).json({ partite });
        } catch (error) {
            next(error);
        }
    }
}

export default WinnerController;
