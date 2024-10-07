import { Request, Response, NextFunction } from 'express';
import WinnerService from '../services/winnerService';
import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';

class WinnerController {

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

export default WinnerController;
