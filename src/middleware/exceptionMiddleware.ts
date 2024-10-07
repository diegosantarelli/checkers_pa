import { handleError } from '../helpers/errorHandler';
import HttpException from '../helpers/errorHandler';
import app from "../app";

/**
 * @middleware ErrorHandlingMiddleware
 * @description Middleware globale per la gestione degli errori nell'applicazione. Cattura gli errori di tipo `HttpException` e li gestisce tramite la funzione `handleError`.
 *
 * @param {HttpException} err - L'errore che si è verificato, tipicamente un'istanza di `HttpException`.
 * @param {any} req - L'oggetto della richiesta Express. Contiene i dati della richiesta HTTP.
 * @param {any} res - L'oggetto della risposta Express. Utilizzato per inviare la risposta HTTP.
 * @param {any} next - La funzione `next()` di Express, utilizzata per passare il controllo al middleware successivo. Non utilizzata in questo caso poiché si gestisce l'errore.
 *
 * @throws {HttpException} - Gli errori catturati dal middleware sono gestiti e inviati come risposta HTTP tramite `handleError`.
 *
 * @returns {void} - Non restituisce nulla, ma invia la risposta HTTP contenente l'errore al client.
 *
 * @example
 * app.use((err: HttpException, req: any, res: any, next: any) => {
 *    handleError(err, res);
 * });
 */
app.use((err: HttpException, req: any, res: any, next: any) => {
    handleError(err, res);
});