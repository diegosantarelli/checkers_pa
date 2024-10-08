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

    /**
     * Restituisce la classifica dei giocatori con ordinamento ascendente o discendente.
     * Questa rotta è pubblica e non richiede autenticazione.
     *
     * @param {Request} req - La richiesta HTTP. Contiene un parametro di query `order` che può essere "asc" o "desc" per determinare l'ordinamento.
     * @param {Response} res - La risposta HTTP che conterrà la classifica dei giocatori.
     * @param {NextFunction} next - Il middleware successivo in caso di errori.
     *
     * @example {200} - Esempio di risposta di successo:
     *  {
     *    "success": true,
     *    "data": [
     *      { "nome": "Simone", "cognome": "Recinelli", "punti_totali": 10 },
     *      { "nome": "Marco", "cognome": "Rossi", "punti_totali": 8 }
     *    ]
     *  }
     */
    public static async classificaGiocatori(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Ottiene il parametro di ordinamento dalla query string (ascendente o discendente)
            const { order } = req.query;
            const sortingOrder = order === 'desc' ? 'DESC' : 'ASC'; // Default: ASC

            // Chiama il servizio per ottenere la classifica dei giocatori
            const classifica = await GameStatusService.getClassificaGiocatori(sortingOrder);

            // Restituisce la classifica dei giocatori
            res.status(StatusCodes.OK).json({
                success: true,
                data: classifica
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getCertificatoVittoria(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;

            const pdfBuffer = await GameStatusService.generaCertificatoPDF(Number(id_partita));

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificato_vittoria_${id_partita}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }
}

export default GameStatusController;