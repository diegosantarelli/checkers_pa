import { Op } from 'sequelize';
import { Partita, Giocatore } from '../models';
import HttpException from '../helpers/errorHandler';
import { isValid, parseISO, format } from 'date-fns';
import { fn, col, where } from 'sequelize';
import { StatusCodes } from 'http-status-codes';

class WinnerService {

    /**
     * @function listaPartiteGiocate
     * @summary Recupera l'elenco delle partite completate giocate da un giocatore.
     * @description Questa funzione restituisce un elenco delle partite completate giocate da un giocatore specifico. È possibile filtrare i risultati fornendo una data specifica. La funzione verifica anche la validità della data e gestisce eccezioni specifiche.
     *
     * @param {number} id_giocatore - L'ID del giocatore per cui recuperare le partite completate.
     * @param {string} [startDate] - Data opzionale in formato ISO (YYYY-MM-DD) per filtrare le partite giocate a partire da quella data.
     *
     * @throws {HttpException} - Se si verificano errori durante la richiesta, viene generata un'eccezione gestita dal middleware di errore. Lancia un'eccezione se la data non è valida o se non ci sono partite trovate.
     *
     * @returns {Promise<object>} - Restituisce un oggetto contenente lo status della richiesta, un messaggio e una lista di oggetti rappresentanti le partite completate giocate, con informazioni su stato, numero di mosse, risultato e data di inizio.
     */
    public static async listaPartiteGiocate(id_giocatore: number, startDate?: string) {
        try {
            console.log("ID Giocatore:", id_giocatore);
            console.log("Start Date:", startDate);

            // Recupera il giocatore per ottenere nome e cognome
            const giocatore = await Giocatore.findByPk(id_giocatore, {
                attributes: ['nome', 'cognome'] // Seleziona solo nome e cognome
            });

            if (!giocatore) {
                throw new HttpException(StatusCodes.NOT_FOUND, 'Giocatore non trovato');
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
                    throw new HttpException(StatusCodes.BAD_REQUEST, 'Formato della data non valido');
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
                    ? `Nessuna partita trovata per la data ${startDate}`
                    : 'Nessuna partita trovata';
                console.warn(message);
                throw new HttpException(StatusCodes.NOT_FOUND, message);
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
                throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore durante la verifica delle partite');
            } else {
                console.error("Errore sconosciuto durante la verifica delle partite");
                throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore sconosciuto durante la verifica delle partite');
            }
        }
    }
}

export default WinnerService;
