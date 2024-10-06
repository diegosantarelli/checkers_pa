import { Partita, Giocatore } from '../models';
import HttpException from '../helpers/errorHandler';

class GameStatusService {
    public static async valutaPartita(id_partita: number, id_giocatore: number): Promise<string> {
        try {
            // Cerca la partita per id
            const partita = await Partita.findByPk(id_partita);

            // Se la partita non esiste
            if (!partita) {
                throw new HttpException(404, 'Partita non trovata');
            }

            // Valutazione del risultato della partita
            let risultato = '';

            // Se la partita è completata e ha un vincitore
            if (partita.stato === 'completata' && partita.id_vincitore) {
                const vincitore = await Giocatore.findByPk(partita.id_vincitore);

                // Se il vincitore esiste
                if (!vincitore) {
                    throw new HttpException(404, 'Vincitore non trovato');
                }

                // Aggiungi punti al vincitore
                vincitore.aggiungiPunto();
                await vincitore.save();

                risultato = `La partita è stata vinta da ${vincitore.nome}`;
            }
            // Se la partita è abbandonata
            else if (partita.stato === 'abbandonata') {
                const giocatore = await Giocatore.findByPk(id_giocatore);

                // Se il giocatore esiste
                if (!giocatore) {
                    throw new HttpException(404, 'Giocatore non trovato');
                }

                // Sottrai punti al giocatore che ha abbandonato
                giocatore.sottraiPunto();
                await giocatore.save();

                risultato = `${giocatore.nome} ha abbandonato la partita e ha perso 0.5 punti`;
            }
            // Se la partita è ancora in corso
            else if (partita.stato === 'in corso') {
                risultato = `Partita in corso`;
            }

            // Se la partita è in uno stato completato, segna come completata
            if (partita.stato !== 'in corso') {
                partita.stato = 'completata';
                await partita.save();
            }

            return risultato;
        } catch (error: unknown) {
            // Verifica se l'errore è un'istanza di HttpException
            if (error instanceof HttpException) {
                throw error;
            }
            // Controlla se error è di tipo Error prima di usare il messaggio
            if (error instanceof Error) {
                throw new HttpException(500, `Errore durante la valutazione della partita: ${error.message}`);
            } else {
                throw new HttpException(500, 'Errore sconosciuto durante la valutazione della partita');
            }
        }
    }

    // Metodo per abbandonare la partita
    public static async abbandonaPartita(id_partita: number, id_giocatore: number): Promise<string> {
        try {
            // Trova la partita per ID
            const partita = await Partita.findByPk(id_partita);

            // Se la partita non esiste
            if (!partita) {
                throw new HttpException(404, 'Partita non trovata');
            }

            // Verifica che il giocatore stia partecipando alla partita
            if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore) {
                throw new HttpException(403, 'Il giocatore non fa parte di questa partita');
            }

            // Verifica che la partita sia ancora in corso
            if (partita.stato !== 'in corso') {
                throw new HttpException(400, 'La partita NON è in corso e non può essere abbandonata');
            }

            // Determina chi vince dopo l'abbandono
            const id_vincitore = partita.id_giocatore1 === id_giocatore ? partita.id_giocatore2 : partita.id_giocatore1;

            // Verifica che ci sia un avversario
            if (!id_vincitore) {
                throw new HttpException(400, 'Non è possibile abbandonare una partita senza un avversario');
            }

            // Imposta lo stato della partita come abbandonata e assegna il vincitore
            partita.stato = 'abbandonata';
            partita.id_vincitore = id_vincitore;
            await partita.save();

            // Penalizza il giocatore che ha abbandonato la partita
            const giocatore = await Giocatore.findByPk(id_giocatore);
            if (giocatore) {
                giocatore.punteggio_totale -= 0.5;
                await giocatore.save();
            }

            return `Il giocatore ${id_giocatore} ha abbandonato la partita. Il giocatore ${id_vincitore} ha vinto.`;
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