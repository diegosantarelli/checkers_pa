import express, { Request, Response } from 'express';
import Giocatore from '../models/Giocatore';
import { verifyPassword } from '../helpers/passwordHelper';
import { generateToken } from '../helpers/jwtHelper'; // Usa la funzione del jwtHelper
import { sequelize } from "../models";

const router = express.Router();
const giocatore = Giocatore(sequelize);

// Rotta di login
router.post('/', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await giocatore.findOne({ where: { email } });

        if (!user || !(await verifyPassword(password, user.hash))) {
            res.status(401).json({ message: 'Credenziali non valide' });
            return;
        }

        // Usa la funzione generateToken di jwtHelper per generare il token
        const token = generateToken({
            id_giocatore: user.id_giocatore,
            ruolo: user.ruolo,
            email: user.email
        });

        // Risposta con il token JWT
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il login', error });
    }
});

export default router;