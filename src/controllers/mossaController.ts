import { Request, Response, NextFunction } from 'express';
import MossaService from '../services/mossaService'; // Importa il servizio delle mosse
import HttpException from "../helpers/errorHandler";
import { StatusCodes } from 'http-status-codes'; // Importa StatusCodes

class mossaController {
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
            const result = await MossaService.executeMove(id_partita, from, to, id_giocatore1);

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

    /**
     * Esporta lo storico delle mosse di una partita.
     *
     * @param {Request} req - La richiesta HTTP con l'ID della partita e il formato di esportazione (JSON o PDF).
     * @param {Response} res - La risposta HTTP contenente lo storico delle mosse esportato.
     * @param {NextFunction} next - Funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @returns {Promise<void>}
     */
    public static async exportMoveHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const format = req.query.format as string; // Cast per specificare che si tratta di una stringa

            console.log(`Richiesta per esportare le mosse per la partita con ID: ${id_partita}`);
            console.log(`Formato richiesto: ${format}`);

            // Verifica se il format è valido
            if (!['json', 'pdf'].includes(format)) {
                throw new HttpException(StatusCodes.BAD_REQUEST, 'Formato non valido. I formati supportati sono "json" e "pdf".');
            }

            const moveHistory = await MossaService.getMoveHistory(Number(id_partita));

            if (moveHistory.length === 0) {
                console.log(`Nessuna mossa trovata per la partita con ID: ${id_partita}`);
            } else {
                console.log(`Mosse trovate per la partita con ID: ${id_partita}:`, moveHistory);
            }

            if (format === 'json') {
                res.json(moveHistory);  // Esportazione in formato JSON
            } else if (format === 'pdf') {
                // Correggi la chiamata alla funzione exportToPDF passando id_partita
                const pdfBuffer = await MossaService.exportToPDF(Number(id_partita));
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="move_history_${id_partita}.pdf"`);
                res.send(pdfBuffer);  // Esportazione in formato PDF
            }
        } catch (error) {
            console.error(`Errore durante l'esportazione dello storico delle mosse:`, error);
            next(error);
        }
    }
}

export default mossaController;
