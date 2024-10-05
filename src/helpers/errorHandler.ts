import { StatusCodes } from 'http-status-codes';

class HttpException extends Error {
    statusCode: number;
    message: string;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;

        // Mantiene il nome del costruttore di classe nella stack trace
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export const handleError = (err: HttpException, res: any) => {
    const { statusCode, message } = err;

    res.status(statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "error",
        statusCode: statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: message.replace(/&#39;/g, "'") // Sostituisci &#39; con '
            .replace(/&quot;/g, '"') // Sostituisci &quot; con "
            .replace(/&amp;/g, '&') // Sostituisci &amp; con &
            .replace(/&lt;/g, '<') // Sostituisci &lt; con <
            .replace(/&gt;/g, '>') // Sostituisci &gt; con >
    });
};

export default HttpException;