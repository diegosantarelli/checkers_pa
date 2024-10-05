import { Request, Response, NextFunction } from 'express';
import MoveService from '../services/mossaService'; // Importa il servizio delle mosse
import HttpException from "../helpers/errorHandler";

class MoveController {
    public static async move(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Controlla se req.user è definito
            if (!req.user) {
                throw new HttpException(401, 'Utente non autenticato.');
            }

            const { id_partita, from, to } = req.body;
            const id_giocatore1 = req.user.id_giocatore; // Ottieni l'ID del giocatore

            // Esegui la mossa e ottieni il risultato
            const result = await MoveService.executeMove(id_partita, from, to, id_giocatore1);

            // Modifica la risposta qui
            res.status(200).json({
                message: "Mossa eseguita con successo",
                id_partita: result.id_partita,
                tavola: JSON.parse(result.tavola) // Assicurati che la tavola sia un oggetto
            });
        } catch (error) {
            next(error); // Passa l'errore al middleware per la gestione degli errori
        }
    }
}

export default MoveController;