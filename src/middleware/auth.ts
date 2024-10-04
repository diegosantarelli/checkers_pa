import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwtHelper';
import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

// interfaccia per il payload del token
interface TokenPayload extends JwtPayload {
    id_giocatore: number;
    ruolo: string;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new HttpException(StatusCodes.UNAUTHORIZED, 'Autenticazione richiesta'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        // Verifica che il token decodificato abbia la struttura corretta
        if (decoded && typeof decoded !== 'string' && 'id_giocatore' in decoded) {
            req.user = decoded as TokenPayload;
            next(); // Continua verso il controller
        } else {
            return next(new HttpException(StatusCodes.UNAUTHORIZED, 'Token non valido'));
        }
    } catch (error) {
        next(error);
    }
};