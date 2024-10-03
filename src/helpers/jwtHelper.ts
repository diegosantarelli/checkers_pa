import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import HttpException from './errorHandler';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

const secret = process.env.JWT_SECRET as string; // Estrae la variabile d’ambiente JWT_SECRET

// Interfaccia per tipizzare il payload
interface TokenPayload {
    id_giocatore: number;
    ruolo: string;
}

/*
Genera il token con durata 1 ora
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

/*
Verifica il token
*/
export const verifyToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === 'string') {
            return null;
        }
        return decoded as JwtPayload; // Se la verifica ha successo ritorna il payload decodificato
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
