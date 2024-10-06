import { Partita, Giocatore } from '../models';
import HttpException from '../helpers/errorHandler';

class GameStatusService {
    public static async valutaPartita(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
        try {
            const partita = await Partita.findByPk(id_partita);

            if (!partita) {
                throw new HttpException(404, 'Partita non trovata');
            }

            let risultato = '';

            if (partita.stato === 'completata' && partita.id_vincitore) {
                const vincitore = await Giocatore.findByPk(partita.id_vincitore);

                if (!vincitore) {
                    throw new HttpException(404, 'Vincitore non trovato');
                }

                vincitore.aggiungiPunto();
                await vincitore.save();

                risultato = `La partita è stata vinta da ${vincitore.nome}`;
            } else if (partita.stato === 'abbandonata') {
                const giocatore = await Giocatore.findByPk(id_giocatore);

                if (!giocatore) {
                    throw new HttpException(404, 'Giocatore non trovato');
                }

                giocatore.sottraiPunto();
                await giocatore.save();

                risultato = `${giocatore.nome} ha abbandonato la partita e ha perso 0.5 punti`;
            } else if (partita.stato === 'in corso') {
                risultato = `Partita in corso`;
            }

            if (partita.stato !== 'in corso') {
                partita.stato = 'completata';
                await partita.save();
            }

            return {
                success: true,
                statusCode: 201,
                risultato
            };
        } catch (error: unknown) {
            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new HttpException(500, `Errore durante la valutazione della partita: ${error.message}`);
            } else {
                throw new HttpException(500, 'Errore sconosciuto durante la valutazione della partita');
            }
        }
    }

    public static async abbandonaPartita(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
        try {
            const partita = await Partita.findByPk(id_partita);

            if (!partita) {
                throw new HttpException(404, 'Partita non trovata');
            }

            if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore) {
                throw new HttpException(403, 'Il giocatore non fa parte di questa partita');
            }

            if (partita.stato !== 'in corso') {
                throw new HttpException(400, 'La partita NON è in corso e non può essere abbandonata');
            }

            const id_vincitore = partita.id_giocatore1 === id_giocatore ? partita.id_giocatore2 : partita.id_giocatore1;

            if (!id_vincitore) {
                throw new HttpException(400, 'Non è possibile abbandonare una partita senza un avversario');
            }

            partita.stato = 'abbandonata';
            partita.id_vincitore = id_vincitore;
            await partita.save();

            const giocatore = await Giocatore.findByPk(id_giocatore);
            if (giocatore) {
                giocatore.punteggio_totale -= 0.5;
                await giocatore.save();
            }

            return {
                success: true,
                statusCode: 201,
                risultato: `Il giocatore ${id_giocatore} ha abbandonato la partita. Il giocatore ${id_vincitore} ha vinto.`
            };
        } catch (error: unknown) {
            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new HttpException(500, `Errore durante l'abbandono della partita: ${error.message}`);
            } else {
                throw new HttpException(500, 'Errore sconosciuto durante abbandono della partita');
            }
        }
    }
}

export default GameStatusService;