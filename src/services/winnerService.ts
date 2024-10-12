import { Op, where, fn, col } from 'sequelize';
import { Partita, Giocatore } from '../models';
import ErrorFactory from '../factories/errorFactory';
import { isValid, parseISO, format } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import HttpException from "../helpers/errorHandler";

/**
 * @class WinnerService
 * @description Servizio per la gestione delle partite completate giocate da un giocatore, con possibilità di filtrare per data.
 */
class WinnerService {

    /**
     * @function getMatchList
     * @summary Recupera l'elenco delle partite completate giocate da un giocatore.
     * @description Questa funzione restituisce l'elenco delle partite completate giocate da un giocatore specifico
     * È possibile filtrare i risultati fornendo una data specifica. La funzione gestisce la validità della data e
     * lancia eccezioni in caso di errori.
     *
     * @param {number} id_giocatore - L'ID del giocatore per cui recuperare le partite completate.
     * @param {string} [startDate] - (Opzionale) Data in formato ISO (YYYY-MM-DD) per filtrare le partite
     * a partire da quella data.
     *
     * @returns {Promise<object>} - Un oggetto che contiene lo stato della richiesta, un messaggio
     * e un array di oggetti rappresentanti le partite giocate.
     *
     * @throws {HttpException} - Se il giocatore non viene trovato, la data non è valida o non vengono trovate partite.
     * Gestisce anche eventuali errori interni.
     */
    public static async getMatchList(id_giocatore: number, startDate?: string) {
        try {
            console.log("ID Giocatore:", id_giocatore);
            console.log("Start Date:", startDate);

            // Recupera il giocatore per ottenere nome e cognome
            const giocatore = await Giocatore.findByPk(id_giocatore, {
                attributes: ['nome', 'cognome'] // Seleziona solo nome e cognome
            });

            if (!giocatore) {
                throw ErrorFactory.createError('NOT_FOUND', 'Giocatore non trovato');
            }

            const whereCondition: any = {
                [Op.or]: [
                    { id_giocatore1: id_giocatore },
                    { id_giocatore2: id_giocatore }
                ],
                stato: 'completata'
            };

            if (startDate) {
                const parsedDate = parseISO(startDate);
                console.log("Data Parsata:", parsedDate);
                if (!isValid(parsedDate)) {
                    throw ErrorFactory.createError('BAD_REQUEST', 'Formato della data non valido');
                }

                // Filtro per la data specifica
                const dateOnly = parsedDate.toISOString().split('T')[0];
                whereCondition[Op.and] = where(fn('DATE', col('data_inizio')), '=', dateOnly);
            }

            console.log("Condizione di query finale:", JSON.stringify(whereCondition));

            const partite = await Partita.findAll({
                where: whereCondition,
                attributes: ['id_partita', 'stato', 'mosse_totali', 'id_vincitore', 'data_inizio']
            });

            console.log("Partite trovate:", partite);

            if (!partite || partite.length === 0) {
                const message = startDate
                    ? `${giocatore.nome} ${giocatore.cognome} non ha giocato nessuna partita in data ${startDate}`
                    : `${giocatore.nome} ${giocatore.cognome} non ha giocato nessuna partita.`;
                console.warn(message);
                throw ErrorFactory.createError('NOT_FOUND', message);
            }

            // Mappatura dei risultati delle partite completate con formattazione della data
            const data = partite.map((partita) => {
                const risultato = partita.id_vincitore === id_giocatore ? 'Vinta' : 'Persa';
                const dataFormattata = format(new Date(partita.data_inizio), 'yyyy-MM-dd'); // Formatta la data

                return {
                    id_partita: partita.id_partita,
                    stato: partita.stato,
                    numero_mosse: partita.mosse_totali,
                    risultato,
                    data_inizio: dataFormattata,
                };
            });

            return {
                success: true,
                statusCode: StatusCodes.OK,
                message: `Elenco delle partite giocate da ${giocatore.nome} ${giocatore.cognome}`,
                data
            };

        } catch (error) {
            if (error instanceof HttpException) {
                console.error("Errore HTTP durante la verifica delle partite:", error.message);
                throw error;
            } else if (error instanceof Error) {
                console.error("Errore generico durante la verifica delle partite:", error.message);
                throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore durante la verifica delle partite');
            } else {
                console.error("Errore sconosciuto durante la verifica delle partite");
                throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore sconosciuto durante la verifica delle partite');
            }
        }
    }
}

export default WinnerService;
