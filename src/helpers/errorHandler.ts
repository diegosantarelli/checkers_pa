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
        super(message); //richiama il costruttore della superclasse Error
        this.statusCode = statusCode;
        this.message = message;

        /* Utilizzato per correggere la catena dei prototipi quando si estende una classe nativa (Error),
        garantendo che l'istanza di HttpException sia trattata correttamente come una sottoclasse. */
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this); /* Utilizzato per catturare e tracciare lo stack di chiamate nel momento in cui l'errore viene
                                       istanziato, utile per il debugging.*/
    }
}

/**
 * Funzione per gestire l'errore nell'applicazione Express e inviare una risposta HTTP al client.
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
