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
        message: message || "Internal Server Error"
    });
};

export default HttpException;
