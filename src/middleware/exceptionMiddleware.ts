import { handleError } from '../helpers/errorHandler';
import HttpException from '../helpers/errorHandler';
import app from "../app";

// Middleware per la gestione degli errori
app.use((err: HttpException, req: any, res: any, next: any) => {
    handleError(err, res);
});
