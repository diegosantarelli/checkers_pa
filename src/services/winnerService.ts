import { Op } from 'sequelize';
import { Partita, Mossa } from '../models';
import HttpException from '../helpers/errorHandler';

class WinnerService {
    public static async verificaPartite(id_giocatore: number, data_inizio: string) {
        try {
            // Costruisci la condizione per la query, filtrando per il giocatore, lo stato completato e la data di inizio
            const whereCondition: any = {
                [Op.or]: [
                    { id_giocatore1: id_giocatore },
                    { id_giocatore2: id_giocatore }
                ],
                stato: 'completata', // Solo partite concluse
                data_inizio: { [Op.eq]: new Date(data_inizio) }, // Filtra per la data specifica di inizio
            };

            // Esegui la query con l'inclusione delle mosse, utilizzando l'alias 'mosse'
            const partite = await Partita.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Mossa,
                        as: 'mosse',  // Usa l'alias corretto per la relazione
                        attributes: ['id_mossa', 'numero_mossa'] // Attributi specifici della mossa
                    }
                ]
            });

            // Mappa i risultati per creare la risposta finale
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
            throw new HttpException(500, 'Errore durante la verifica delle partite');
        }
    }
}

export default WinnerService;
