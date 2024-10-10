import { handleError } from '../helpers/errorHandler';
import HttpException from '../helpers/errorHandler';
import ErrorFactory from '../factories/errorFactory';
import app from "../app";

/**
 * @middleware ErrorHandlingMiddleware
 * @description Middleware globale per la gestione degli errori nell'applicazione.
 * Cattura tutti gli errori non gestiti che si verificano durante il ciclo di vita di una richiesta
 * e li gestisce in modo appropriato, restituendo una risposta con il codice di stato e il messaggio d'errore.
 *
 * @param {HttpException} err - L'errore che si è verificato durante la richiesta.
 * @param {any} req - L'oggetto richiesta HTTP Express.
 * @param {any} res - L'oggetto risposta HTTP Express.
 * @param {any} next - La funzione `next` per passare il controllo al middleware successivo.
 *
 * @description
 * - Se l'errore non è un'istanza di `HttpException`, viene generato un errore generico utilizzando `ErrorFactory`.
 * - Gli errori vengono gestiti tramite la funzione `handleError`, che restituisce una risposta HTTP appropriata.
 */
app.use((err: HttpException, req: any, res: any, next: any) => {
    if (!(err instanceof HttpException)) {
        err = ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore sconosciuto.');
    }

    handleError(err, res);
});
