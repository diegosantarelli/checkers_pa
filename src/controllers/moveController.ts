import { Request, Response, NextFunction } from 'express';
import MoveService from '../services/moveService';
import ErrorFactory from '../factories/errorFactory';
import { StatusCodes } from 'http-status-codes';
import HttpException from '../helpers/errorHandler';

/**
 * @class moveController
 * @description Controller per la gestione delle mosse e l'esportazione dello storico delle mosse di una partita.
 */
class moveController {
    /**
     * Effettua una mossa nel gioco.
     *
     * @function move
     * @memberof moveController
     *
     * @param {Request} req - La richiesta HTTP contenente l'ID della partita, la posizione di origine
     * e di destinazione della mossa, e l'utente autenticato.
     * - `id_partita` è l'ID della partita in cui viene effettuata la mossa.
     * - `from` è la posizione di origine della mossa.
     * - `to` è la posizione di destinazione della mossa.
     *
     * Inoltre, viene stampata nella dashboard una tabella contenente tutte le possibili mosse effettuabili:
     *                           ┌─────────┬────────┬─────────────┬
     *                           │ (index) │ origin │ destination │
     *                           ├─────────┼────────┼─────────────┼
     *                           │    0    │  'A7'  │    'E7'     │
     *                           │    1    │  'A7'  │    'F7'     │
     *                           │    2    │  'D7'  │    'H7'     │
     *                           │    3    │  'C7'  │    'G7'     │
     *                           │    4    │  'C7'  │    'H7'     │
     *                           │    5    │  'B7'  │    'F7'     │
     *                           │    6    │  'B7'  │    'G7'     │
     *                           └─────────┴────────┴─────────────┴
     *
     * @param {Response} res - La risposta HTTP che conterrà il risultato della mossa effettuata,
     * incluso un messaggio di successo e la descrizione della mossa.
     * @param {NextFunction} next - Funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @returns {Promise<void>} - Restituisce una risposta JSON contenente la descrizione della mossa.
     *
     * @throws {HttpException} - Lancia un'eccezione se l'utente non è autenticato o se si verifica un errore durante
     * l'esecuzione della mossa.
     *
     * @example
     * // Richiesta di esempio:
     * // POST /do/move
     * // {
     * //   "id_partita": 1,
     * //   "from": "A7",
     * //   "to": "B7"
     * // }
     * // Risposta di esempio:
     * // {
     * //   "success": true,
     * //   "statusCode": 201,
     * //   "message": "Mossa eseguita correttamente",
     * //   "data": {
     * //     "move": "Hai mosso un pezzo singolo di colore nero da A7 a F7."
     * //   }
     * // }
     */
    public static async move(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Verifica se req.user è definito
            if (!req.user) {
                throw ErrorFactory.createError('UNAUTHORIZED', 'Utente non autenticato.');
            }

            const { id_partita, from, to } = req.body;
            const id_giocatore1 = req.user.id_giocatore;

            // Esegui la mossa e ottieni il risultato
            const result = await MoveService.executeMove(id_partita, from, to, id_giocatore1);

            // Risposta con la descrizione della mossa
            res.status(StatusCodes.CREATED).json({
                success: true,
                statusCode: StatusCodes.CREATED,
                message: 'Mossa eseguita correttamente',
                data: {
                    move: result.moveDescription
                }
            });
        } catch (error) {
            console.error('Errore durante l\'esecuzione della mossa:', error); // Aggiungi un log dettagliato
            if (error instanceof HttpException) {
                next(error);
            } else {
                next(ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore sconosciuto durante la esecuzione della mossa'));
            }
        }
    }

    /**
     * Esporta lo storico delle mosse di una partita.
     *
     * @function exportMoveHistory
     * @memberof moveController
     *
     * @param {Request} req - La richiesta HTTP contenente l'ID della partita come parametro
     * e il formato di esportazione (`json` o `pdf`) come query string.
     * - `id_partita` è l'ID della partita di cui esportare le mosse.
     * - `format` può essere "json" o "pdf" e specifica il formato dell'esportazione.
     * @param {Response} res - La risposta HTTP contenente lo storico delle mosse esportato in formato JSON o PDF.
     * @param {NextFunction} next - Funzione che passa il controllo al middleware successivo in caso di errore.
     *
     * @returns {Promise<void>} - Restituisce un file PDF o un oggetto JSON con lo storico delle mosse della partita.
     *
     * @throws {HttpException} - Lancia un'eccezione se si verifica un errore durante l'esportazione dello storico
     * delle mosse o se viene fornito un formato non valido.
     *
     * @example
     * // Richiesta per esportare lo storico delle mosse in formato JSON:
     * // GET /do/move-history/1?format=json
     * // Risposta:
     * // [
     * //   {
     * //      "numeroMossa": 1,
     * //      "origin": "A6",
     * //      "destination": "B5",
     * //      "dataMossa": "2024-10-10 13:45:13"
     * //  },
     * //  {
     * //      "numeroMossa": 2,
     * //      "origin": "H3",
     * //      "destination": "E4",
     * //      "dataMossa": "2024-10-10 13:45:13"
     * //  }
     * // ]
     *
     * @example
     * // Richiesta per esportare lo storico delle mosse in formato PDF:
     * // GET /do/move-history/1?format=pdf
     * // Risposta: File PDF con lo storico delle mosse scaricato.
     */
    public static async exportMoveHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_partita } = req.params;
            const format = req.query.format as string;

            console.log(`Richiesta per esportare le mosse per la partita con ID: ${id_partita}`);
            console.log(`Formato richiesto: ${format}`);

            // Verifica se il formato è valido
            if (!['json', 'pdf'].includes(format)) {
                throw ErrorFactory.createError('BAD_REQUEST', 'Formato non valido. I formati supportati sono "json" e "pdf".');
            }

            const moveHistory = await MoveService.getMoveHistory(Number(id_partita));

            if (moveHistory.length === 0) {
                console.log(`Nessuna mossa trovata per la partita con ID: ${id_partita}`);
            } else {
                console.log(`Mosse trovate per la partita con ID: ${id_partita}:`, moveHistory);
            }

            if (format === 'json') {
                res.json(moveHistory);  // Esportazione in formato JSON
            } else if (format === 'pdf') {
                const pdfBuffer = await MoveService.exportToPDF(Number(id_partita));
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="move_history_${id_partita}.pdf"`);
                res.send(pdfBuffer);  // Esportazione in formato PDF
            }
        } catch (error) {
            console.error(`Errore durante l'esportazione dello storico delle mosse:`, error);
            next(ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore durante la esportazione dello storico delle mosse'));
        }
    }
}

export default moveController;
