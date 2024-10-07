import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwtHelper';
import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

/**
 * Interfaccia che rappresenta il payload del token JWT autenticato.
 *
 * @interface TokenPayload
 * @extends {JwtPayload}
 * @property {number} id_giocatore - L'ID del giocatore autenticato.
 * @property {string} email - L'email del giocatore autenticato.
 * @property {string} ruolo - Il ruolo del giocatore (ad es. "utente", "admin").
 */
interface TokenPayload extends JwtPayload {
    id_giocatore: number;
    email: string;
    ruolo: string;
}

/**
 * Middleware per autenticare un utente tramite JWT.
 *
 * @function authenticateJWT
 *
 * @param {Request} req - La richiesta HTTP. Si aspetta l'header `Authorization` con il formato "Bearer <token>".
 * @param {Response} res - La risposta HTTP.
 * @param {NextFunction} next - Funzione che passa il controllo al middleware o controller successivo.
 *
 * @description
 * Questo middleware verifica che l'header `Authorization` contenga un token JWT valido. Se il token è presente e valido, il payload viene aggiunto alla proprietà `req.user`. In caso di errore o assenza del token, viene lanciata un'eccezione `HttpException` con lo stato `401 Unauthorized`.
 *
 * @throws {HttpException} Se l'header `Authorization` è assente, se il token non è valido o se il payload del token è mancante o non corretto.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new HttpException(StatusCodes.UNAUTHORIZED, 'Autenticazione richiesta'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        // Verifica che il token decodificato abbia la struttura corretta
        if (decoded && typeof decoded !== 'string' && 'id_giocatore' in decoded && 'email' in decoded) {
            req.user = decoded as TokenPayload;
            next(); // Continua verso il controller
        } else {
            return next(new HttpException(StatusCodes.UNAUTHORIZED, 'Token non valido o payload mancante'));
        }
    } catch (error) {
        next(new HttpException(StatusCodes.UNAUTHORIZED, 'Token non valido'));
    }
};
