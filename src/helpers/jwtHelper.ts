import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import HttpException from './errorHandler';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

const secret = process.env.JWT_SECRET as string; // Estrae la variabile d’ambiente JWT_SECRET

/**
 * @interface TokenPayload
 * @description Definisce la struttura del payload del token JWT.
 * @property {number} id_giocatore - L'ID del giocatore.
 * @property {string} email - L'email del giocatore.
 * @property {string} ruolo - Il ruolo del giocatore (es. 'utente' o 'admin').
 */
interface TokenPayload {
    id_giocatore: number;
    email: string;
    ruolo: string;
}

/**
 * @function generateToken
 * @description Genera un token JWT utilizzando il payload fornito e lo firma con il segreto configurato. La durata del token è di 1 ora.
 *
 * @param {TokenPayload} payload - Il payload da includere nel token JWT, contenente l'ID del giocatore, l'email e il ruolo.
 *
 * @throws {HttpException} - Lancia un'eccezione se si verifica un errore durante la generazione del token.
 *
 * @returns {string} - Restituisce il token JWT generato.
 *
 * @example
 * const payload = { id_giocatore: 1, email: 'user@example.com', ruolo: 'utente' };
 * const token = generateToken(payload);
 * console.log(token); // Restituisce un token JWT
 */
export const generateToken = (payload: TokenPayload): string => {
    try {
        return jwt.sign(payload, secret, { expiresIn: '1h' });
    } catch (e) {
        // Logga l'errore per tracciabilità
        console.error('Errore durante la generazione del token:', e);
        throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore nella generazione del token');
    }
};

/**
 * @function verifyToken
 * @description Verifica e decodifica il token JWT utilizzando il segreto configurato. Restituisce il payload decodificato se il token è valido.
 *
 * @param {string} token - Il token JWT da verificare.
 *
 * @throws {HttpException} - Lancia un'eccezione se il token è scaduto, non valido o se si verifica un errore durante la verifica.
 *
 * @returns {JwtPayload | null} - Restituisce il payload decodificato se il token è valido, altrimenti null.
 *
 * @example
 * const token = 'someValidJWTToken';
 * const decodedPayload = verifyToken(token);
 * console.log(decodedPayload); // Restituisce il payload decodificato o null
 */
export const verifyToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === 'string') {
            return null;
        }
        return decoded as JwtPayload; // Se la verifica ha successo, ritorna il payload decodificato
    } catch (e) {
        // Logga l'errore per tracciabilità
        console.error('Errore durante la verifica del token:', e);

        if (e instanceof jwt.TokenExpiredError) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token scaduto');
        } else if (e instanceof jwt.JsonWebTokenError) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'Token non valido');
        } else {
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore nella verifica del token');
        }
    }
};