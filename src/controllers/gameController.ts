import { Request, Response, NextFunction } from 'express';
import { Giocatore, Partita } from '../models';
import HttpException from '../helpers/errorHandler';

class GameController {
    public static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id_giocatore } = req.user!; // Verifica che req.user sia correttamente impostato
            const { livello_IA } = req.body;

            // Logica per creare la partita
            const giocatore = await Giocatore.findByPk(id_giocatore);
            if (!giocatore) {
                throw new HttpException(404, 'Giocatore non trovato');
            }

            // resto della logica per creare la partita
            const partita = await Partita.create({
                id_giocatore1: giocatore.id_giocatore,
                id_giocatore2: livello_IA ? null : req.body.id_giocatore2,
                livello_IA: livello_IA || null,
                stato: 'in corso',
            });

            res.status(201).json({ message: 'Partita creata con successo', partita });
        } catch (error) {
            next(error);
        }
    }
}

export default GameController;
