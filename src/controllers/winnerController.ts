import { Request, Response, NextFunction } from 'express';
import WinnerService from '../services/winnerService';
import HttpException from '../helpers/errorHandler';

class WinnerController {
    public static async verificaPartite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate } = req.query;
            const id_giocatore = req.user?.id_giocatore; // Recupera l'ID dal token JWT

            if (!id_giocatore) {
                throw new HttpException(401, 'Autenticazione richiesta');
            }

            // Chiama il servizio per verificare le partite
            const partite = await WinnerService.verificaPartite(id_giocatore, startDate as string);

            // Risposta con i risultati delle partite
            res.status(200).json({ partite });
        } catch (error) {
            next(error);
        }
    }
}

export default WinnerController;
