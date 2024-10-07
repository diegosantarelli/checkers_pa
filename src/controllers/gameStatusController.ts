import { Request, Response, NextFunction } from 'express';
import GameStatusService from '../services/gameStatusService';
import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';

class GameStatusController {
    /**
     * Valuta lo stato di una partita in base all'ID e all'ID del giocatore.
     *
     * @param {Request} req - La richiesta HTTP, contenente l'ID della partita e l'ID del giocatore autenticato.
     * @param {Response} res - La risposta HTTP, che restituisce lo stato valutato della partita.
     * @param {NextFunction} next - Il middleware successivo in caso di errori.
     * @returns {Promise<void>} - La risposta con il risultato della valutazione della partita.
     *
     * @throws {HttpException} - Se l'autenticazione non è presente o la partita non esiste.
     */
    public static async valutaPartita(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) {
                throw new HttpException(StatusCodes.UNAUTHORIZED, 'Autenticazione richiesta');
            }

            const risultato = await GameStatusService.valutaPartita(Number(id_partita), id_giocatore);

            res.status(StatusCodes.OK).json({ risultato });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Permette a un giocatore di abbandonare una partita in corso.
     *
     * @param {Request} req - La richiesta HTTP, contenente l'ID della partita e l'ID del giocatore autenticato.
     * @param {Response} res - La risposta HTTP, che restituisce il risultato dell'abbandono della partita.
     * @param {NextFunction} next - Il middleware successivo in caso di errori.
     * @returns {Promise<void>} - La risposta con il risultato dell'abbandono della partita.
     *
     * @throws {HttpException} - Se l'autenticazione non è presente o la partita non esiste.
     */
    public static async abbandonaPartita(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) {
                throw new HttpException(StatusCodes.UNAUTHORIZED, 'Autenticazione richiesta');
            }

            const risultato = await GameStatusService.abbandonaPartita(Number(id_partita), id_giocatore);

            res.status(StatusCodes.OK).json({ risultato });
        } catch (error) {
            next(error);
        }
    }
}

export default GameStatusController;