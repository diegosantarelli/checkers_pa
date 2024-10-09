import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';

/**
 * @class ErrorFactory
 * @description Factory per creare errori HttpException personalizzati.
 */
class ErrorFactory {
    /**
     * Crea un'istanza di HttpException in base al tipo di errore specificato.
     *
     * @param {string} type - Il tipo di errore da creare.
     * @param {string} message - Il messaggio di errore.
     * @returns {HttpException} - L'istanza di errore creata.
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
