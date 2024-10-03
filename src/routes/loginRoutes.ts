import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Giocatore from '../models/Giocatore';  // Importa il tuo modello
import { verifyPassword } from '../helpers/passwordHelper';
import {sequelize} from "../models";  // Funzione che verifica le password

const router = express.Router();
const giocatore = Giocatore(sequelize);

// Funzione per generare il token JWT
const generateToken = (userId: string, role: string): string => {
    const payload = {
        id: userId,
        role: role
    };

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: '1h'  // Durata del token
    });
};

// Rotta di login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await giocatore.findOne({ where: { email } });

        if (!user || !(await verifyPassword(password, user.hash))) {
            res.status(401).json({ message: 'Credenziali non valide' });
            return;
        }
        // Generazione del token JWT
        const token = generateToken(user.id_giocatore.toString(), user.ruolo);
        // Risposta con il token JWT
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il login', error });
    }
});

export default router;
