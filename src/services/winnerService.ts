import { Op } from 'sequelize';
import { Partita, Mossa } from '../models';
import HttpException from '../helpers/errorHandler';

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

            if (startDate) {
                whereCondition.data_inizio = { [Op.gte]: new Date(startDate) };
            }

            // Log la condizione di query
            console.log("Condizione di query:", JSON.stringify(whereCondition));

            const partite = await Partita.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Mossa,
                        as: 'mosse',
                        attributes: ['id_mossa', 'numero_mossa']
                    }
                ]
            });

            // Log le partite trovate
            console.log("Partite trovate:", partite);

            if (!partite || partite.length === 0) {
                console.error("Nessuna partita trovata per i criteri specificati");
                throw new HttpException(404, 'Nessuna partita trovata per i criteri specificati');
            }

            return partite.map((partita) => {
                const numeroMosse = (partita as any).mosse ? (partita as any).mosse.length : 0;
                const risultato = partita.id_vincitore === id_giocatore ? 'Vinta' : 'Persa';
                return {
                    id_partita: partita.id_partita,
                    stato: partita.stato,
                    numero_mosse: numeroMosse,
                    risultato,
                    data_inizio: partita.data_inizio,
                };
            });

        } catch (error) {
            console.error("Errore durante la verifica delle partite:", error); // Aggiungi un log dettagliato dell'errore
            throw new HttpException(500, 'Errore durante la verifica delle partite');
        }
    }
}

export default WinnerService;
