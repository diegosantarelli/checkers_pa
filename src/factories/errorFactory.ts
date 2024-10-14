import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';

/**
 * @module ErrorFactory
 * @description Factory per creare errori `HttpException` personalizzati.
 *
 * Questo modulo fornisce una classe `ErrorFactory` che consente di creare istanze di `HttpException`
 * basate su tipi di errore predefiniti, implementando il pattern Factory.
 */
class ErrorFactory {
    /**
     * Crea un'istanza di `HttpException` in base al tipo di errore specificato.
     *
     * @static
     * @param {string} type - Il tipo di errore da creare. Deve essere uno dei seguenti:
     *   - `'NOT_FOUND'`
     *   - `'UNAUTHORIZED'`
     *   - `'FORBIDDEN'`
     *   - `'BAD_REQUEST'`
     *   - `'INTERNAL_SERVER_ERROR'`
     * @param {string} [message] - Il messaggio di errore personalizzato.
     * Se non fornito, viene utilizzato un messaggio di default.
     * @returns {HttpException} - L'istanza di errore creata.
     *
     * @throws {HttpException} - Lancia un'istanza di `HttpException` con il codice di stato e il messaggio specificati.
     */
    static createError(type: string, message: string): HttpException {
        switch (type) {
            case 'NOT_FOUND':
                return new HttpException(StatusCodes.NOT_FOUND, message || 'Risorsa non trovata.');
            case 'UNAUTHORIZED':
                return new HttpException(StatusCodes.UNAUTHORIZED, message || 'Non autorizzato.');
            case 'FORBIDDEN':
                return new HttpException(StatusCodes.FORBIDDEN, message || 'Accesso vietato.');
            case 'BAD_REQUEST':
                return new HttpException(StatusCodes.BAD_REQUEST, message || 'Richiesta non valida.');
            case 'INTERNAL_SERVER_ERROR':
            default:
                return new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, message || 'Errore interno del server.');
        }
    }
}

export default ErrorFactory;
