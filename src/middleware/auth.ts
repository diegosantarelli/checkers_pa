import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwtHelper';
import ErrorFactory from '../factories/errorFactory';
import { JwtPayload } from 'jsonwebtoken';

/**
 * @interface TokenPayload
 * @extends {JwtPayload}
 * @description Interfaccia che rappresenta il payload del token JWT autenticato.
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
 * @function authenticateJWT
 * @description Middleware per autenticare un utente tramite JWT.
 *
 * @param {Request} req - La richiesta HTTP. Si aspetta l'header `Authorization` con il formato "Bearer <token>".
 * @param {Response} res - La risposta HTTP.
 * @param {NextFunction} next - Funzione che passa il controllo al middleware o controller successivo.
 *
 * @throws {HttpException} - Lancia un'eccezione se l'header `Authorization` è assente, se il token non è valido
 * o se il payload del token è mancante o non corretto.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(ErrorFactory.createError('UNAUTHORIZED', 'Autenticazione richiesta'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        // Verifica che il token decodificato abbia la struttura corretta
        if (decoded && typeof decoded !== 'string' && 'id_giocatore' in decoded && 'email' in decoded) {
            req.user = decoded as TokenPayload;
            next(); // Continua verso il controller
        } else {
            return next(ErrorFactory.createError('UNAUTHORIZED', 'Token non valido o payload mancante'));
        }
    } catch (error) {
        next(ErrorFactory.createError('UNAUTHORIZED', 'Token non valido'));
    }
};

/**
 * @function isAdmin
 * @description Middleware per verificare se l'utente autenticato è un admin.
 *
 * @param {Request} req - La richiesta HTTP, con il token JWT decodificato e aggiunto a `req.user`.
 * @param {Response} res - La risposta HTTP.
 * @param {NextFunction} next - Funzione che passa il controllo al middleware o controller successivo.
 *
 * @throws {HttpException} - Lancia un'eccezione se l'utente non ha il ruolo di "admin".
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (user && user.ruolo === 'admin') {
        return next(); // Se l'utente ha il ruolo di admin, continua al middleware successivo
    }
    next(ErrorFactory.createError('FORBIDDEN', 'Accesso non autorizzato, solo gli admin possono accedere'));
};
