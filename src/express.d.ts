import { JwtPayload } from 'jsonwebtoken';

/**
 * Estende la tipizzazione globale di Express per aggiungere la proprietà `user` all'interfaccia Request.
 *
 * serve a estendere l'oggetto Request di Express per includere una proprietà opzionale chiamata user,
 * che conterrà le informazioni sull'utente autenticato, come l'ID del giocatore, l'email e il ruolo,
 * dopo che un token JWT è stato verificato.
 *
 * Ogni volta che si accede a req.user nei controller o middleware,
 * TypeScript saprà che req.user contiene questi dati dell'utente.
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
