import { Request, Response, NextFunction } from 'express';
import { creaPartita } from '../services/gameService';
import HttpException from "../helpers/errorHandler";
import { StatusCodes } from 'http-status-codes';

class GameController {
    /**
     * Metodo statico per creare una partita.
     *
     * @function createGame
     *
     * @param {Request} req - La richiesta HTTP. Deve contenere l'utente autenticato in `req.user` e i parametri del corpo per la creazione della partita: `email_giocatore2` (opzionale), `tipo` e `livello_IA` (opzionale).
     * @param {Response} res - La risposta HTTP. In caso di successo, restituisce lo stato 201 per PvP o 200 per PvAI, insieme ai dettagli della partita creata.
     * @param {NextFunction} next - Funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @description
     * Questo metodo verifica se l'utente è autenticato e procede a creare una partita. L'utente può creare una partita contro un altro giocatore specificando `email_giocatore2` o contro l'intelligenza artificiale specificando `livello_IA`. Entrambi i parametri non possono essere forniti contemporaneamente e almeno uno dei due deve essere presente.
     *
     * @throws {HttpException} - Se l'utente non è autenticato, l'id del giocatore è mancante o i parametri forniti non sono corretti.
     *
     * @returns {Promise<void>} - Restituisce una risposta JSON con i dettagli della partita creata, a seconda che sia PvP o PvAI.
     *
     * @example
     * // Richiesta per creare una partita contro un altro giocatore
     * {
     *   "email_giocatore2": "altro@example.com",
     *   "tipo": "Competitiva"
     * }
     *
     * // Richiesta per creare una partita contro l'IA
     * {
     *   "livello_IA": "difficile",
     *   "tipo": "Amichevole"
     * }
     *
     * // Risposta di successo per PvP
     * {
     *   "success": true,
     *   "statusCode": 201,
     *   "message": "Partita PvP creata con successo",
     *   "data": { ...dettagli_partita }
     * }
     *
     * // Risposta di successo per PvAI
     * {
     *   "success": true,
     *   "statusCode": 200,
     *   "message": "Partita contro IA creata con successo",
     *   "data": { ...dettagli_partita }
     * }
     */
    public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Verifica che l'utente sia autenticato
            if (!req.user || !req.user.id_giocatore) {
                throw new HttpException(StatusCodes.UNAUTHORIZED, 'Utente non autenticato o id_giocatore mancante');
            }

            const { id_giocatore } = req.user!;
            const { email_giocatore2, tipo, livello_IA } = req.body;

            // Verifica che solo uno dei due parametri sia fornito
            if ((email_giocatore2 && livello_IA) || (!email_giocatore2 && !livello_IA)) {
                throw new HttpException(StatusCodes.BAD_REQUEST, 'Devi specificare o email del giocatore 2 oppure il livello IA.');
            }

            // Creazione della partita
            const result = await creaPartita(id_giocatore, email_giocatore2, tipo, livello_IA);

            if ('id_giocatore2' in result.data && result.data.id_giocatore2 !== null) {
                // Partita PvP creata con successo
                res.status(StatusCodes.CREATED).json({
                    success: true,
                    statusCode: StatusCodes.CREATED,
                    message: "Partita PvP creata con successo",
                    data: result.data
                });
            } else {
                // Partita PvAI creata con successo
                res.status(StatusCodes.OK).json({
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: "Partita contro IA creata con successo",
                    data: result.data
                });
            }
        } catch (error) {
            // Gestione dell'errore tramite il middleware di gestione degli errori
            next(error);
        }
    }
}

export default GameController;
