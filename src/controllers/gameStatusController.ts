import { Request, Response, NextFunction } from 'express';
import GameStatusService from '../services/gameStatusService';
import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';
import WinnerService from "../services/winnerService";

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

    /**
     * @function listaPartite
     * @summary Recupera l'elenco delle partite giocate dal giocatore autenticato.
     * @description Questa funzione permette di ottenere l'elenco delle partite giocate dal giocatore autenticato. È possibile filtrare l'elenco delle partite fornendo una data di inizio facoltativa tramite query string.
     *
     * @param {Request} req - L'oggetto della richiesta Express contenente i parametri e il token JWT autenticato.
     * @param {Response} res - L'oggetto della risposta Express che restituisce l'elenco delle partite giocate.
     * @param {NextFunction} next - La funzione successiva che gestisce eventuali errori.
     *
     * @queryparam {string} [startDate] - Data opzionale in formato ISO (YYYY-MM-DD) per filtrare le partite giocate a partire da quella data.
     *
     * @throws {HttpException} - Se l'ID del giocatore non è presente (autenticazione mancante) o se si verificano errori durante la richiesta, viene generata un'eccezione gestita dal middleware di errore.
     *
     * @returns {Promise<void>} - Restituisce una risposta JSON contenente l'elenco delle partite giocate.
     *
     * @example {200} - Esempio di risposta di successo senza il filtraggio della data:
     *  {
     *     "partite": {
     *         "success": true,
     *         "statusCode": 200,
     *         "message": "Elenco delle partite giocate da Simone Recinelli",
     *         "data": [
     *             {
     *                 "id_partita": 1,
     *                 "stato": "completata",
     *                 "numero_mosse": 5,
     *                 "risultato": "Vinta",
     *                 "data_inizio": "2023-12-19"
     *             },
     *             {
     *                 "id_partita": 3,
     *                 "stato": "completata",
     *                 "numero_mosse": 8,
     *                 "risultato": "Persa",
     *                 "data_inizio": "2024-03-23"
     *             },
     *         ]
     *     }
     * }
     *
     * @example {200} - Esempio di risposta di successo con filtraggio della data:
     * {
     *     "partite": {
     *         "success": true,
     *         "statusCode": 200,
     *         "message": "Elenco delle partite giocate da Simone Recinelli",
     *         "data": [
     *             {
     *                 "id_partita": 1,
     *                 "stato": "completata",
     *                 "numero_mosse": 5,
     *                 "risultato": "Vinta",
     *                 "data_inizio": "2023-12-19"
     *             }
     *         ]
     *     }
     * }
     *
     * @example {401} - Esempio di errore di autenticazione:
     *  {
     *    "error": "Autenticazione richiesta"
     *  }
     */

    public static async listaPartite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate } = req.query;
            const id_giocatore = req.user?.id_giocatore; // Recupera l'ID dal token JWT

            // Controlla se l'utente è autenticato
            if (!id_giocatore) {
                throw new HttpException(StatusCodes.UNAUTHORIZED, 'Autenticazione richiesta');
            }

            // Chiama il servizio per recuperare le partite
            const partite = await WinnerService.listaPartiteGiocate(id_giocatore, startDate as string);

            // Risposta con l'elenco delle partite
            res.status(StatusCodes.OK).json({ partite });
        } catch (error) {
            // Usa lo status code presente nell'eccezione, se disponibile, altrimenti imposta un errore generico
            if (error instanceof HttpException) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                next(new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore durante la richiesta'));
            }
        }
    }
}

export default GameStatusController;