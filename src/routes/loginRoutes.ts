import express, { Request, Response, NextFunction } from 'express';
import Giocatore from '../models/Giocatore';
import { verifyPassword } from '../helpers/passwordHelper';
import { generateToken } from '../helpers/jwtHelper';
import { sequelize } from "../models";
import ErrorFactory from '../factories/errorFactory';
import { StatusCodes } from "http-status-codes";

const router = express.Router();
const giocatore = Giocatore(sequelize);

// Espressione regolare per convalidare l'email nei formati tuo_username@example.com o tuo_username@example.it
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
    const { email, password } = req.body;

    try {
        // Controlla se l'email ha un formato valido
        if (!emailRegex.test(email)) {
            throw ErrorFactory.createError('BAD_REQUEST', 'Formato email non valido, deve essere nel formato tuo_username@example.com o tuo_username@example.it');
        }

        // Trova il giocatore in base all'email
        const user = await giocatore.findOne({ where: { email } });

        // Se il giocatore non esiste o la password è errata, lancia un'eccezione (401)
        if (!user || !(await verifyPassword(password, user.hash))) {
            throw ErrorFactory.createError('UNAUTHORIZED', 'Credenziali non valide');
        }

        // Genera un token JWT usando i dettagli del giocatore
        const token = generateToken({
            id_giocatore: user.id_giocatore,
            ruolo: user.ruolo,
            email: user.email
        });

        // Restituisce il token JWT al client
        res.status(StatusCodes.OK).json({ token });
    } catch (error) {
        // Passa l'errore al gestore centrale degli errori
        next(error);
    }
});

export default router;
