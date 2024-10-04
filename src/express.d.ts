import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { id_giocatore: number; email:string; ruolo: string };
        }
    }
}
