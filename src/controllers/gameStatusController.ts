import { Request, Response, NextFunction } from 'express';
import GameStatusService from '../services/gameStatusService';
import HttpException from '../helpers/errorHandler';

class GameStatusController {
    public static async valutaPartita(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) {
                throw new HttpException(401, 'Autenticazione richiesta');
            }

            const risultato = await GameStatusService.valutaPartita(Number(id_partita), id_giocatore);

            res.status(200).json({ risultato });
        } catch (error) {
            next(error);
        }
    }

    // Metodo per abbandonare la partita
    public static async abbandonaPartita(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) {
                throw new HttpException(401, 'Autenticazione richiesta');
            }

            const risultato = await GameStatusService.abbandonaPartita(Number(id_partita), id_giocatore);

            res.status(200).json({ risultato });
        } catch (error) {
            next(error);
        }
    }
}

export default GameStatusController;