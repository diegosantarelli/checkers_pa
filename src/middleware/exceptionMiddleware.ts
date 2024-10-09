import { handleError } from '../helpers/errorHandler';
import HttpException from '../helpers/errorHandler';
import ErrorFactory from '../factories/errorFactory'; // Importa la Factory
import app from "../app";

/**
 * @middleware ErrorHandlingMiddleware
 * @description Middleware globale per la gestione degli errori nell'applicazione.
 */
app.use((err: HttpException, req: any, res: any, next: any) => {
    // Se non è un'istanza di HttpException, crea un errore generico con la factory
    if (!(err instanceof HttpException)) {
        err = ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore sconosciuto.');
    }

    handleError(err, res);
});
