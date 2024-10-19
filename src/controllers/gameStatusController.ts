import { Request, Response, NextFunction } from 'express';
import GameStatusService from '../services/gameStatusService';
import ErrorFactory from "../factories/errorFactory";
import { StatusCodes } from 'http-status-codes';
import WinnerService from "../services/winnerService";
import HttpException from "../helpers/errorHandler";

/**
 * @class GameStatusController
 * @description Controller per la gestione dello stato delle partite, la classifica dei giocatori
 * e la generazione di certificati di vittoria.
 */
class GameStatusController {

    /**
     * Valuta lo stato di una partita in base all'ID della partita e all'ID del giocatore autenticato.
     *
     * @function evaluateGame
     * @memberof GameStatusController
     * @param {Request} req - La richiesta HTTP che contiene l'ID della partita nei parametri e l'ID del giocatore autenticato.
     * @param {Response} res - La risposta HTTP con il risultato della valutazione della partita.
     * @param {NextFunction} next - La funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @throws {HttpException} - Se l'utente non è autenticato o se si verifica un errore durante l'elaborazione della richiesta.
     *
     * @returns {Promise<void>} - Restituisce un oggetto JSON con il risultato della valutazione della partita.
     */

    public static async evaluateGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params; // prendiamo l'id_partita dai parametri della richiesta
            const id_giocatore = req.user?.id_giocatore; //se req.user esiste e ha la proprietà id_giocatore
                                                                          // se null, non lancia un errore ma undefined
            if (!id_giocatore) {
                throw ErrorFactory.createError('UNAUTHORIZED', 'Autenticazione richiesta');
            }

            const data = await GameStatusService.evaluateGame(Number(id_partita), id_giocatore);

            res.status(StatusCodes.OK).json({ data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Permette a un giocatore di abbandonare una partita in corso.
     *
     * @function abandonGame
     * @memberof GameStatusController
     * @param {Request} req - La richiesta HTTP che contiene l'ID della partita nei parametri e l'ID del giocatore autenticato.
     * @param {Response} res - La risposta HTTP con il risultato dell'abbandono della partita.
     * @param {NextFunction} next - La funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @throws {HttpException} - Se l'utente non è autenticato o se si verifica un errore durante l'abbandono della partita.
     *
     * @returns {Promise<void>} - Restituisce un oggetto JSON con il risultato dell'abbandono della partita.
     */
    public static async abandonGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params; //prendiamo id_partita dai parametri della richiesta
            const id_giocatore = req.user?.id_giocatore;//se req.user esiste e ha la proprietà id_giocatore
                                                                        // se null, non lancia un errore ma undefined
            if (!id_giocatore) {
                throw ErrorFactory.createError('UNAUTHORIZED', 'Autenticazione richiesta');
            }

            const data = await GameStatusService.abandonGame(Number(id_partita), id_giocatore);

            res.status(StatusCodes.OK).json({ data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restituisce la classifica dei giocatori con ordinamento ascendente o discendente.
     *
     * @function playersRanking
     * @memberof GameStatusController
     * @param {Request} req - La richiesta HTTP che può contenere il parametro `order` per specificare l'ordinamento.
     * @param {Response} res - La risposta HTTP con la classifica dei giocatori.
     * @param {NextFunction} next - La funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @returns {Promise<void>} - Restituisce un oggetto JSON con la classifica dei giocatori.
     */
    public static async playersRanking(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { order } = req.query; //preso l'order che preferiamo dalla richiesta
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
     * Restituisce il certificato di vittoria di una partita in formato PDF.
     *
     * @function getVictoryCertify
     * @memberof GameStatusController
     * @param {Request} req - La richiesta HTTP che contiene l'ID della partita nei parametri.
     * @param {Response} res - La risposta HTTP che invia il certificato di vittoria come file PDF.
     * @param {NextFunction} next - La funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @returns {Promise<void>} - Invia un file PDF come risposta.
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
     * Recupera l'elenco delle partite giocate dal giocatore autenticato, con un'opzione di filtro per la data di inizio.
     *
     * @function getMatchList
     * @memberof GameStatusController
     * @param {Request} req - La richiesta HTTP che può contenere `startDate` come parametro di query per filtrare
     * le partite in base alla data di inizio.
     * @param {Response} res - La risposta HTTP con l'elenco delle partite.
     * @param {NextFunction} next - La funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @throws {HttpException} - Se l'utente non è autenticato o se si verifica un errore durante il recupero dell'elenco
     * delle partite.
     *
     * @returns {Promise<void>} - Restituisce un oggetto JSON con l'elenco delle partite giocate dal giocatore.
     */
    public static async getMatchList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate } = req.query;
            const id_giocatore = req.user?.id_giocatore;

            if (!id_giocatore) { //non serve
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
