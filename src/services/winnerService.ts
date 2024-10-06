import { Op } from 'sequelize';
import { Partita } from '../models'; // Non serve più importare Mossa
import HttpException from '../helpers/errorHandler';
import { isValid, parseISO } from 'date-fns'; // Importa date-fns per la validazione della data

class WinnerService {
    public static async verificaPartite(id_giocatore: number, startDate?: string) {
        try {
            // Log per controllare i parametri in ingresso
            console.log("ID Giocatore:", id_giocatore);
            console.log("Start Date:", startDate);

            const whereCondition: any = {
                [Op.or]: [
                    { id_giocatore1: id_giocatore },
                    { id_giocatore2: id_giocatore }
                ],
                stato: 'completata',
            };

            // Validazione della data
            if (startDate) {
                const parsedDate = parseISO(startDate);
                if (!isValid(parsedDate)) {
                    throw new HttpException(400, 'Formato della data non valido');
                }
                whereCondition.data_inizio = { [Op.gte]: parsedDate };
            }

            // Log della condizione di query
            console.log("Condizione di query (completa):", JSON.stringify(whereCondition));

            // Esegui la query per trovare le partite completate
            const partite = await Partita.findAll({
                where: whereCondition,
                attributes: ['id_partita', 'stato', 'mosse_totali', 'id_vincitore', 'data_inizio'] // Seleziona solo gli attributi necessari
            });

            // Log le partite trovate
            console.log("Partite trovate:", partite);

            // Controllo se non ci sono partite
            if (!partite || partite.length === 0) {
                console.warn("Nessuna partita trovata per i criteri specificati");
                throw new HttpException(404, 'Nessuna partita trovata per i criteri specificati');
            }

            // Mappatura dei risultati delle partite
            return partite.map((partita) => {
                const risultato = partita.id_vincitore === id_giocatore ? 'Vinta' : 'Persa';
                return {
                    id_partita: partita.id_partita,
                    stato: partita.stato,
                    numero_mosse: partita.mosse_totali, // Usa l'attributo 'mosse_totali'
                    risultato,
                    data_inizio: partita.data_inizio,
                };
            });

        } catch (error) {
            console.error("Errore durante la verifica delle partite:");
            throw new HttpException(500, 'Errore durante la verifica delle partite');
        }
    }
}

export default WinnerService;
