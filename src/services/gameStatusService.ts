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

            // Se la partita è completata e ha un vincitore
            if (partita.stato === 'completata' && partita.id_vincitore) {
                const vincitore = await Giocatore.findByPk(partita.id_vincitore);

                if (!vincitore) {
                    throw new HttpException(404, 'Vincitore non trovato');
                }

                risultato = `La partita è stata vinta da ${vincitore.nome}`;
            }
            // Se la partita è abbandonata
            else if (partita.stato === 'abbandonata') {
                const giocatore = await Giocatore.findByPk(id_giocatore);

                if (!giocatore) {
                    throw new HttpException(404, 'Giocatore non trovato');
                }

                risultato = `${giocatore.nome} ha abbandonato la partita`;
            }
            // Se la partita è ancora in corso
            else if (partita.stato === 'in corso') {
                risultato = `Partita in corso`;
            }

            // Restituisce semplicemente lo stato della partita senza alterare il punteggio
            return {
                success: true,
                statusCode: 200,
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

    // Metodo per abbandonare la partita
    public static async abbandonaPartita(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
        try {
            const partita = await Partita.findByPk(id_partita);

            if (!partita) {
                throw new HttpException(404, 'Partita non trovata');
            }

            // Verifica se la partita è contro l'IA (id_giocatore2 è null ma livello_IA è definito)
            const isPartitaControIA = partita.id_giocatore2 === null && partita.livello_IA !== null;

            if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore && !isPartitaControIA) {
                throw new HttpException(403, 'Il giocatore non fa parte di questa partita');
            }

            if (partita.stato !== 'in corso') {
                throw new HttpException(400, 'La partita NON è in corso e non può essere abbandonata');
            }

            // Se la partita è contro l'IA, non solleviamo l'errore "Non è possibile abbandonare una partita senza un avversario"
            const id_vincitore = isPartitaControIA ? partita.id_giocatore1 : (partita.id_giocatore1 === id_giocatore ? partita.id_giocatore2 : partita.id_giocatore1);

            partita.stato = 'abbandonata';
            partita.id_vincitore = id_vincitore;
            await partita.save();

            // Penalizza il giocatore che ha abbandonato la partita
            const giocatore = await Giocatore.findByPk(id_giocatore);
            if (giocatore) {
                giocatore.punteggio_totale -= 0.5;
                await giocatore.save();
            }

            if (!isPartitaControIA && id_vincitore) {
                // Aggiungi 1 punto al vincitore della partita abbandonata (solo per partite PvP)
                const vincitore = await Giocatore.findByPk(id_vincitore);
                if (vincitore) {
                    vincitore.punteggio_totale += 1;
                    await vincitore.save();
                }

                return {
                    success: true,
                    statusCode: 201,
                    risultato: `Il giocatore ${id_giocatore} ha abbandonato la partita. Il giocatore ${id_vincitore} ha vinto e ha ricevuto 1 punto.`
                };
            }

            return {
                success: true,
                statusCode: 201,
                risultato: `Il giocatore ${id_giocatore} ha abbandonato la partita contro l'IA ed ha perso 0.5 punti`
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
