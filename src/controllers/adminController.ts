import { Request, Response, NextFunction } from 'express';
import { Giocatore } from '../models';
import ErrorFactory from '../factories/errorFactory';
import { StatusCodes } from 'http-status-codes';
/**
 * @class AdminController
 * @description Controlla le operazioni amministrative dell'applicazione, come la ricarica del credito di un giocatore.
 */
class AdminController {
    /**
     * Ricarica il credito di un utente specificato tramite l'email.
     * Questo metodo consente agli amministratori di aggiornare il saldo dei token di un utente.
     *
     * @async
     * @method creditRecharge
     * @memberof AdminController
     * @param {Request} req - L'oggetto richiesta Express, che contiene il corpo della richiesta con `email` e `nuovoCredito`.
     * @param {Response} res - L'oggetto risposta Express, utilizzato per inviare la risposta al client.
     * @param {NextFunction} next - La funzione di callback per passare il controllo al middleware successivo.
     * @throws {Error} BAD_REQUEST - Se l'email o il nuovo credito non sono forniti o sono invalidi.
     * @throws {Error} NOT_FOUND - Se l'utente con l'email specificata non viene trovato.
     * @throws {Error} BAD_REQUEST - Se il credito è inferiore a 0.
     * @returns {Promise<void>} - Restituisce una risposta JSON con il successo dell'operazione o passa l'errore al middleware di gestione errori.
     */
    static async creditRecharge(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, nuovoCredito } = req.body;

            // Verifica che i parametri nel body siano forniti
            if (!email || nuovoCredito === undefined) {
                throw ErrorFactory.createError('BAD_REQUEST', 'Email e nuovo credito sono obbligatori');
            }

            // Verifica il formato dell'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw ErrorFactory.createError('BAD_REQUEST', `Email ${email} non è valida. Usa un formato email valido.`);
            }

            // Verifica che il nuovo credito sia >= 0
            if (nuovoCredito < 0) {
                throw ErrorFactory.createError('BAD_REQUEST', 'Il credito non può essere negativo');
            }

            // Trova l'utente con l'email specificata
            const user = await Giocatore.findOne({ where: { email } });
            if (!user) {
                throw ErrorFactory.createError('NOT_FOUND', `Utente con mail ${email} non trovato`);
            }

            // Aggiorna il credito dell'utente
            user.token_residuo = nuovoCredito;
            await user.save();

            // Invia la risposta con lo stato 201 Created
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
