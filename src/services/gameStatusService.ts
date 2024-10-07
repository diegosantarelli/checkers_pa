import { Partita, Giocatore } from '../models';
import HttpException, { handleError } from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';

/**
 * Servizio per la gestione dello stato delle partite, inclusa la valutazione e l'abbandono delle partite.
 */
class GameStatusService {
    /**
     * Valuta lo stato di una partita e restituisce il risultato basato sullo stato attuale della partita.
     *
     * @param {number} id_partita - L'ID della partita da valutare.
     * @param {number} id_giocatore - L'ID del giocatore che richiede la valutazione.
     * @returns {Promise<{ success: boolean, statusCode: number, risultato: string }>} - Un oggetto contenente il successo dell'operazione, il codice di stato e il risultato.
     * @throws {HttpException} - Lancia un'eccezione in caso di partita non trovata o di errori durante la valutazione.
     */
    public static async valutaPartita(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
        try {
            const partita = await Partita.findByPk(id_partita);

            if (!partita) {
                throw new HttpException(StatusCodes.NOT_FOUND, 'Partita non trovata');
            }

            let risultato = '';

            // Se la partita è completata e ha un vincitore
            if (partita.stato === 'completata' && partita.id_vincitore) {
                const vincitore = await Giocatore.findByPk(partita.id_vincitore);

                if (!vincitore) {
                    throw new HttpException(StatusCodes.NOT_FOUND, 'Vincitore non trovato');
                }

                risultato = `La partita è stata vinta da ${vincitore.nome}`;
            }
            // Se la partita è abbandonata
            else if (partita.stato === 'abbandonata') {
                const giocatore = await Giocatore.findByPk(id_giocatore);

                if (!giocatore) {
                    throw new HttpException(StatusCodes.NOT_FOUND, 'Giocatore non trovato');
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
                statusCode: StatusCodes.OK,
                risultato
            };
        } catch (error: unknown) {
            return GameStatusService.handleError(error, 'Errore durante la valutazione della partita');
        }
    }

    /**
     * Permette a un giocatore di abbandonare la partita e assegna punti penalità o bonus in base all'esito.
     *
     * @param {number} id_partita - L'ID della partita che si desidera abbandonare.
     * @param {number} id_giocatore - L'ID del giocatore che vuole abbandonare la partita.
     * @returns {Promise<{ success: boolean, statusCode: number, risultato: string }>} - Un oggetto contenente il successo dell'operazione, il codice di stato e il risultato.
     * @throws {HttpException} - Lancia un'eccezione in caso di partita non trovata o di errori durante l'abbandono della partita.
     */
    public static async abbandonaPartita(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
        try {
            const partita = await Partita.findByPk(id_partita);

            if (!partita) {
                throw new HttpException(StatusCodes.NOT_FOUND, 'Partita non trovata');
            }

            // Verifica se la partita è contro l'IA (id_giocatore2 è null ma livello_IA è definito)
            const isPartitaControIA = partita.id_giocatore2 === null && partita.livello_IA !== null;

            if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore && !isPartitaControIA) {
                throw new HttpException(StatusCodes.FORBIDDEN, 'Il giocatore non fa parte di questa partita');
            }

            if (partita.stato !== 'in corso') {
                throw new HttpException(StatusCodes.BAD_REQUEST, 'La partita NON è in corso e non può essere abbandonata');
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
                    statusCode: StatusCodes.CREATED,
                    risultato: `Il giocatore ${id_giocatore} ha abbandonato la partita. Il giocatore ${id_vincitore} ha vinto e ha ricevuto 1 punto.`
                };
            }

            return {
                success: true,
                statusCode: StatusCodes.CREATED,
                risultato: `Il giocatore ${id_giocatore} ha abbandonato la partita contro l'IA ed ha perso 0.5 punti`
            };
        } catch (error: unknown) {
            return GameStatusService.handleError(error, 'Errore durante l\'abbandono della partita');
        }
    }

    /**
     * Gestisce gli errori catturati durante l'esecuzione delle operazioni e lancia l'eccezione appropriata.
     *
     * @param {unknown} error - L'errore catturato durante l'esecuzione del codice.
     * @param {string} defaultMessage - Messaggio predefinito da utilizzare in caso di errore sconosciuto.
     * @returns {never} - Lancia un'eccezione `HttpException` con il messaggio di errore.
     */
    private static handleError(error: unknown, defaultMessage: string): never {
        if (error instanceof HttpException) {
            throw error;
        }
        if (error instanceof Error) {
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, `${defaultMessage}: ${error.message}`);
        } else {
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, defaultMessage);
        }
    }
}

export default GameStatusService;