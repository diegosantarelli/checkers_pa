import { StatusCodes } from 'http-status-codes';

/**
 * @class HttpException
 * @extends {Error}
 * @description Classe personalizzata per la gestione delle eccezioni HTTP. Estende la classe nativa `Error` di JavaScript.
 *
 * @property {number} statusCode - Il codice di stato HTTP associato all'errore.
 * @property {string} message - Il messaggio descrittivo dell'errore.
 */
class HttpException extends Error {
    statusCode: number;
    message: string;

    /**
     * Crea un'istanza di HttpException.
     *
     * @constructor
     * @param {number} statusCode - Il codice di stato HTTP dell'errore.
     * @param {string} message - Il messaggio descrittivo dell'errore.
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
 * Funzione per gestire l'errore e inviare una risposta HTTP.
 *
 * @function handleError
 * @param {HttpException} err - L'errore di tipo `HttpException` che si è verificato.
 * @param {any} res - L'oggetto di risposta Express utilizzato per inviare la risposta HTTP.
 *
 * @description Questa funzione invia una risposta HTTP formattata con il codice di stato e il messaggio di errore.
 * Inoltre, sostituisce alcuni caratteri HTML codificati come entità con i loro caratteri originali.
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
