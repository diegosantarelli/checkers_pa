import { Request, Response, NextFunction } from 'express';
import Giocatore from '../models/Giocatore';
import ErrorFactory from '../factories/errorFactory';
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../models";

const giocatore = Giocatore(sequelize);

class AdminController {
    static async creditRecharge(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, nuovoCredito } = req.body;

            // Verifica che i parametri siano forniti
            if (!email || nuovoCredito === undefined) {
                throw ErrorFactory.createError('BAD_REQUEST', "Email e nuovo credito sono obbligatori");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw ErrorFactory.createError('BAD_REQUEST', `Email ${email} non è valida. Usa un formato email valido.`);
            }

            // Verifica che il nuovo credito sia >= 0
            if (nuovoCredito < 0) {
                throw ErrorFactory.createError('BAD_REQUEST', "Il credito non può essere negativo");
            }

            // Trova l'utente con l'email specificata
            const user = await giocatore.findOne({ where: { email } });
            if (!user) {
                throw ErrorFactory.createError('NOT_FOUND', `Utente con mail ${email} non trovato`);
            }

            // Aggiorna il credito dell'utente
            user.token_residuo = nuovoCredito;
            await user.save();

            // Invia la risposta con lo stato 200
            res.status(StatusCodes.CREATED).json({
                success: true,
                statusCode: StatusCodes.CREATED,
                message: `Credito aggiornato per l'utente ${user.nome} ${user.cognome}`,
                data: {
                    email: user.email,
                    token_residuo: user.token_residuo
                }
            });
        } catch (error) {
            next(error); // Passa l'errore al middleware di gestione errori
        }
    }
}

export default AdminController;
