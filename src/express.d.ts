import { JwtPayload } from 'jsonwebtoken';

/**
 * Estende la tipizzazione globale di Express per aggiungere la proprietà `user` all'interfaccia Request.
 *
 * @typedef {object} UserPayload
 * @property {number} id_giocatore - L'ID del giocatore associato al token JWT.
 * @property {string} email - L'email del giocatore associato al token JWT.
 * @property {string} ruolo - Il ruolo dell'utente (ad esempio, 'utente' o 'admin').
 *
 * @typedef {JwtPayload & UserPayload} AuthenticatedUser
 *
 * @global
 * @namespace Express
 * @interface Request
 * @property {AuthenticatedUser} [user] - Dati dell'utente autenticato estratti dal token JWT.
 */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { id_giocatore: number; email:string; ruolo: string };
        }
    }
}
