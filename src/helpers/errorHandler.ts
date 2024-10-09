import { StatusCodes } from 'http-status-codes';

/**
 * Classe HttpException personalizzata per la gestione degli errori HTTP.
 *
 * @class
 * @extends {Error}
 */
class HttpException extends Error {
    statusCode: number;
    message: string;

    /**
     * Crea un'istanza di HttpException.
     *
     * @param {number} statusCode - Il codice di stato HTTP.
     * @param {string} message - Il messaggio di errore.
     */
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;

        // Mantiene il nome del costruttore di classe nella stack trace
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

/**
 * Funzione per gestire l'errore e inviare una risposta.
 *
 * @param {HttpException} err - L'errore che si è verificato.
 * @param {any} res - L'oggetto di risposta Express.
 */
export const handleError = (err: HttpException, res: any) => {
    const { statusCode, message } = err;

    res.status(statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "error",
        statusCode: statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: message.replace(/&#39;/g, "'") // Sostituisce &#39; con '
            .replace(/&quot;/g, '"') // Sostituisce &quot; con "
            .replace(/&amp;/g, '&') // Sostituisce &amp; con &
            .replace(/&lt;/g, '<') // Sostituisce &lt; con <
            .replace(/&gt;/g, '>') // Sostituisce &gt; con >
    });
};

export default HttpException;
