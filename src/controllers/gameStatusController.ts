import { Request, Response, NextFunction } from 'express';
import GameStatusService from '../services/gameStatusService';
import ErrorFactory from "../factories/errorFactory";
import { StatusCodes } from 'http-status-codes';
import WinnerService from "../services/winnerService";
import HttpException from "../helpers/errorHandler";

class GameStatusController {
    /**
     * Valuta lo stato di una partita in base all'ID e all'ID del giocatore.
     */
    public static async evaluateGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) {
                throw ErrorFactory.createError('UNAUTHORIZED', 'Autenticazione richiesta');
            }

            const risultato = await GameStatusService.evaluateGame(Number(id_partita), id_giocatore);

            res.status(StatusCodes.OK).json({ risultato });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Permette a un giocatore di abbandonare una partita in corso.
     */
    public static async abandonGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) {
                throw ErrorFactory.createError('UNAUTHORIZED', 'Autenticazione richiesta');
            }

            const risultato = await GameStatusService.abandonGame(Number(id_partita), id_giocatore);

            res.status(StatusCodes.OK).json({ risultato });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restituisce la classifica dei giocatori con ordinamento ascendente o discendente.
     */
    public static async playersRanking(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { order } = req.query;
            const sortingOrder = order === 'desc' ? 'DESC' : 'ASC';

            const classifica = await GameStatusService.playersRanking(sortingOrder);

            res.status(StatusCodes.OK).json({
                success: true,
                data: classifica
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restituisce il certificato di vittoria di una partita.
     */
    public static async getVictoryCertify(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;

            const pdfBuffer = await GameStatusService.getVictoryCertify(Number(id_partita));

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificato_vittoria_${id_partita}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Recupera l'elenco delle partite giocate dal giocatore autenticato.
     */
    public static async getMatchList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate } = req.query;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) {
                throw ErrorFactory.createError('UNAUTHORIZED', 'Autenticazione richiesta');
            }

            const partite = await WinnerService.getMatchList(id_giocatore, startDate as string);

            res.status(StatusCodes.OK).json({ partite });
        } catch (error) {
            if (error instanceof HttpException) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                next(ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore durante la richiesta'));
            }
        }
    }
}

export default GameStatusController;
