import { Op } from 'sequelize';
import { Partita } from '../models';
import HttpException from '../helpers/errorHandler';
import { isValid, parseISO } from 'date-fns';
import { fn, col, where } from 'sequelize';

class WinnerService {
    // Funzione per ottenere l'elenco delle partite giocate
    public static async listaPartiteGiocate(id_giocatore: number, startDate?: string) {
        try {
            // Log per controllare i parametri in ingresso
            console.log("ID Giocatore:", id_giocatore);
            console.log("Start Date:", startDate);

            const whereCondition: any = {
                [Op.or]: [
                    { id_giocatore1: id_giocatore },
                    { id_giocatore2: id_giocatore }
                ]
            };

            // Aggiungi il filtro della data se è presente
            if (startDate) {
                const parsedDate = parseISO(startDate);
                console.log("Data Parsata:", parsedDate); // Log della data parsata
                if (!isValid(parsedDate)) {
                    throw new HttpException(400, 'Formato della data non valido');
                }

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
                throw new HttpException(404, message);
            }

            // Mappatura dei risultati delle partite
            return partite.map((partita) => {
                const risultato = partita.id_vincitore === id_giocatore ? 'Vinta' : 'Persa';
                return {
                    id_partita: partita.id_partita,
                    stato: partita.stato,
                    numero_mosse: partita.mosse_totali,
                    risultato,
                    data_inizio: partita.data_inizio,
                };
            });

        } catch (error) {
            if (error instanceof HttpException) {
                console.error("Errore HTTP durante la verifica delle partite:", error.message);
                throw error;
            } else if (error instanceof Error) {
                console.error("Errore generico durante la verifica delle partite:", error.message);
                throw new HttpException(500, 'Errore durante la verifica delle partite');
            } else {
                console.error("Errore sconosciuto durante la verifica delle partite");
                throw new HttpException(500, 'Errore sconosciuto durante la verifica delle partite');
            }
        }
    }
}

export default WinnerService;