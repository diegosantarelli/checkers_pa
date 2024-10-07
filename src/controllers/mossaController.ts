import { Request, Response, NextFunction } from 'express';
import MoveService from '../services/mossaService'; // Importa il servizio delle mosse
import HttpException from "../helpers/errorHandler";
import { StatusCodes } from 'http-status-codes'; // Importa StatusCodes

class MoveController {
    /**
     * Effettua una mossa nel gioco.
     *
     * @param {Request} req - La richiesta HTTP contenente l'ID della partita, la posizione di origine e di destinazione della mossa, e l'utente autenticato.
     * @param {Response} res - La risposta HTTP che conterrà il risultato della mossa effettuata.
     * @param {NextFunction} next - Funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @returns {Promise<void>} - Restituisce una risposta JSON contenente la descrizione della mossa.
     *
     * @throws {HttpException} - Lancia un'eccezione se l'utente non è autenticato o se si verifica un errore durante l'esecuzione della mossa.
     */
    public static async move(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Verifica se req.user è definito
            if (!req.user) {
                throw new HttpException(StatusCodes.UNAUTHORIZED, 'Utente non autenticato.');
            }

            const { id_partita, from, to } = req.body;
            const id_giocatore1 = req.user.id_giocatore; // Ottieni l'ID del giocatore
            const ruolo = req.user.ruolo; // Ottieni il ruolo dell'utente

            // Esegui la mossa e ottieni il risultato
            const result = await MoveService.executeMove(id_partita, from, to, id_giocatore1, ruolo);

            // Risposta con la descrizione della mossa
            res.status(StatusCodes.CREATED).json({
                success: true,
                statusCode: StatusCodes.CREATED,
                message: "Mossa eseguita correttamente",
                data: {
                    move: result.moveDescription
                }
            });
        } catch (error) {
            if (error instanceof HttpException) {
                next(error); // Passa l'errore al middleware per la gestione degli errori
            } else {
                next(new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore sconosciuto durante la esecuzione della mossa'));
            }
        }
    }
}

export default MoveController;
