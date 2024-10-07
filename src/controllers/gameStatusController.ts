import { Request, Response, NextFunction } from 'express';
import GameStatusService from '../services/gameStatusService';
import HttpException from '../helpers/errorHandler';

class GameStatusController {
    /**
     * Valuta lo stato di una partita.
     * @param {Request} req - La richiesta HTTP.
     * @param {Response} res - La risposta HTTP.
     * @param {NextFunction} next - Passa il controllo al middleware successivo.
     * @returns {Promise<void>} - Restituisce il risultato della valutazione della partita.
     */
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

    /**
     * Permette a un giocatore di abbandonare una partita.
     * @param {Request} req - La richiesta HTTP.
     * @param {Response} res - La risposta HTTP.
     * @param {NextFunction} next - Passa il controllo al middleware successivo.
     * @returns {Promise<void>} - Restituisce il risultato dell'abbandono della partita.
     */
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
