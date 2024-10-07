import express, { Request, Response } from 'express';
import Giocatore from '../models/Giocatore';
import { verifyPassword } from '../helpers/passwordHelper';
import { generateToken } from '../helpers/jwtHelper'; // Usa la funzione del jwtHelper
import { sequelize } from "../models";

const router = express.Router();
const giocatore = Giocatore(sequelize);

/**
 * Rotta di login per autenticare un giocatore.
 *
 * @route POST /login
 *
 * @param {Request} req - La richiesta HTTP contenente l'email e la password nel corpo della richiesta.
 * @param {Response} res - La risposta HTTP che conterrà un token JWT se l'autenticazione ha successo.
 *
 * @returns {Promise<void>} - Restituisce un token JWT se le credenziali sono valide, altrimenti restituisce un errore 401.
 *
 * @example
 * // Corpo della richiesta:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * // Risposta di successo:
 * {
 *   "token": "jwt_token_string"
 * }
 *
 * @throws {401} - Se l'email o la password non sono valide.
 * @throws {500} - Se si verifica un errore durante il processo di login.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        // Trova il giocatore in base all'email
        const user = await giocatore.findOne({ where: { email } });

        // Se il giocatore non esiste o la password è errata, restituisce un errore 401
        if (!user || !(await verifyPassword(password, user.hash))) {
            res.status(401).json({ message: 'Credenziali non valide' });
            return;
        }

        // Genera un token JWT usando i dettagli del giocatore
        const token = generateToken({
            id_giocatore: user.id_giocatore,
            ruolo: user.ruolo,
            email: user.email
        });

        // Restituisce il token JWT al client
        res.status(200).json({ token });
    } catch (error) {
        // Se si verifica un errore durante l'autenticazione, restituisce un errore 500
        res.status(500).json({ message: 'Errore durante il login', error });
    }
});

export default router;
