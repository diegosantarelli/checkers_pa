import { Request, Response, NextFunction } from 'express';
import { createGame } from '../services/gameService';
import ErrorFactory from '../factories/errorFactory';
import { StatusCodes } from 'http-status-codes';

/**
 * @class GameController
 * @description Controller per la gestione delle operazioni di creazione della partita.
 * Consente la creazione di partite tra giocatori (PvP) o contro l'intelligenza artificiale (PvAI).
 */
class GameController {
    /**
     * Metodo statico per creare una partita.
     *
     * @function createGame
     * @memberof GameController
     *
     * @param {Request} req - La richiesta HTTP.
     * Deve contenere l'utente autenticato in `req.user` e i parametri del corpo per la creazione della partita:
     * `email_giocatore2` (opzionale), `tipo`, e `livello_IA` (opzionale).
     * - `email_giocatore2` è opzionale e serve per creare una partita contro un altro giocatore.
     * - `livello_IA` è opzionale e serve per creare una partita contro l'intelligenza artificiale.
     * @param {Response} res - La risposta HTTP.
     * In caso di successo, restituisce lo stato 201 per PvP o 200 per PvAI, insieme ai dettagli della partita creata.
     * @param {NextFunction} next - Funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @description
     * Questo metodo consente di creare una nuova partita, verificando che l'utente sia autenticato. L'utente può creare una partita contro un altro giocatore specificando `email_giocatore2` oppure contro l'intelligenza artificiale specificando `livello_IA`. I parametri `email_giocatore2` e `livello_IA` non possono essere forniti contemporaneamente e almeno uno dei due deve essere presente.
     *
     * @throws {HttpException} - Viene lanciata un'eccezione se l'utente non è autenticato, se l'id del giocatore è mancante, o se i parametri forniti non sono corretti.
     *
     * @returns {Promise<void>} - Restituisce una risposta JSON con i dettagli della partita creata, a seconda che sia una partita PvP (contro un altro giocatore) o PvAI (contro l'intelligenza artificiale).
     *
     * @example
     * // Richiesta per creare una partita PvP:
     * // POST /game
     * // {
     * //   "email_giocatore2": "secondoplayer@example.com",
     * //   "tipo": "Competitiva"
     * // }
     *
     * // Risposta per partita PvP creata:
     * // {
     * //   "success": true,
     * //   "statusCode": 201,
     * //   "message": "Partita PvP creata con successo",
     * //   "data": {
     * //     "id_partita": 5,
     * //     "id_giocatore1": 1,
     * //     "id_giocatore2": 2,
     * //     "stato": "in corso",
     * //     "tipo": "Competitiva"
     * //   }
     * // }
     *
     *
     * // Richiesta per creare una partita PvAI:
     * // POST /game
     * // {
     * //   "livello_IA": "normale",
     * //   "tipo": "Amichevole"
     * // }
     *
     * // Risposta per partita PvAI creata:
     * // {
     * //   "success": true,
     * //   "statusCode": 200,
     * //   "message": "Partita contro IA creata con successo",
     * //   "data": {
     * //     "id_partita": 6,
     * //     "id_giocatore1": 1,
     * //     "livello_IA": "normale",
     * //     "stato": "in corso",
     * //     "tipo": "Amichevole"
     * //   }
     * // }
     */
    public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Verifica che l'utente sia autenticato
            if (!req.user || !req.user.id_giocatore) {
                throw ErrorFactory.createError('UNAUTHORIZED', 'Utente non autenticato o id_giocatore mancante');
            }

            const { id_giocatore } = req.user!;
            const { email_giocatore2, tipo, livello_IA } = req.body;

            // Verifica che solo uno dei due parametri sia fornito
            if ((email_giocatore2 && livello_IA) || (!email_giocatore2 && !livello_IA)) {
                throw ErrorFactory.createError('BAD_REQUEST', 'Devi specificare o email del giocatore 2 oppure il livello IA.');
            }

            // Creazione della partita
            const result = await createGame(id_giocatore, email_giocatore2, tipo, livello_IA);

            if ('id_giocatore2' in result.data && result.data.id_giocatore2 !== null) {
                // Partita PvP creata con successo
                res.status(StatusCodes.CREATED).json({
                    success: true,
                    statusCode: StatusCodes.CREATED,
                    message: 'Partita PvP creata con successo',
                    data: result.data
                });
            } else {
                // Partita PvAI creata con successo
                res.status(StatusCodes.OK).json({
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: 'Partita contro IA creata con successo',
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
