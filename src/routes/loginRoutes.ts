import express, { Request, Response, NextFunction } from 'express';
import {Giocatore} from "../models";
import { verifyPassword } from '../helpers/passwordHelper';
import { generateToken } from '../helpers/jwtHelper';
import ErrorFactory from '../factories/errorFactory';
import { StatusCodes } from "http-status-codes";

const router = express.Router(); //nuova istanza di Router (agisce come una sotto-applicazione collegabile all'applicazione Express)

const emailRegex = /^[a-zA-Z0-9._%+-]+@example\.(com|it)$/;

/**
 * Rotta di login per autenticare un giocatore.
 *
 * @route POST /login
 *
 * @param {Request} req - La richiesta HTTP contenente l'email e la password nel corpo della richiesta.
 * @param {Response} res - La risposta HTTP che conterrà un token JWT se l'autenticazione ha successo.
 * @param {NextFunction} next - Funzione che passa il controllo al middleware successivo (per gestione degli errori).
 *
 * @returns {Promise<void>} - Restituisce un token JWT se le credenziali sono valide, altrimenti gestisce l'errore.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body; //destructive assignment, estrae i valori di email e password dal body della richiesta

    try {
        if (!emailRegex.test(email)) {
            throw ErrorFactory.createError('BAD_REQUEST', 'Formato email non valido, deve essere nel formato tuo_username@example.com o tuo_username@example.it');
        }

        const user = await Giocatore.findOne({ where: { email } });

        if (!user || !(await verifyPassword(password, user.hash))) {
            throw ErrorFactory.createError('UNAUTHORIZED', 'Credenziali non valide');
        }

        const token = generateToken({
            id_giocatore: user.id_giocatore,
            ruolo: user.ruolo,
            email: user.email
        });

        res.status(StatusCodes.OK).json({ token }); //invia al client una risposta HTTP con codice 200 e ritorna il JWT token
    } catch (error) {
        next(error); // Passa l'errore al gestore centrale degli errori
    }
});

export default router;
