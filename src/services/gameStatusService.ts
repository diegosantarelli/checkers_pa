import { Partita, Giocatore } from '../models';
import HttpException from '../helpers/errorHandler';
import { StatusCodes } from 'http-status-codes';
import PdfPrinter from 'pdfmake';
import { format, parseISO } from 'date-fns'; // Importa date-fns


/**
 * Servizio per la gestione dello stato delle partite, inclusa la valutazione e l'abbandono delle partite.
 */
class GameStatusService {
    // Metodo esistente: valutaPartita
    public static async evaluateGame(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
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

                risultato = `${giocatore.nome} ${giocatore.cognome} ha abbandonato la partita`;
            }
            // Se la partita è ancora in corso
            else if (partita.stato === 'in corso') {
                risultato = `Partita in corso`;
            }

            return {
                success: true,
                statusCode: StatusCodes.OK,
                risultato
            };
        } catch (error: unknown) {
            return GameStatusService.handleError(error, 'Errore durante la valutazione della partita');
        }
    }

    public static async abandonGame(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
        try {
            const partita = await Partita.findByPk(id_partita);

            if (!partita) {
                throw new HttpException(StatusCodes.NOT_FOUND, 'Partita non trovata');
            }

            const isPartitaControIA = partita.id_giocatore2 === null && partita.livello_IA !== null;

            if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore && !isPartitaControIA) {
                throw new HttpException(StatusCodes.FORBIDDEN, 'Il giocatore non fa parte di questa partita');
            }

            if (partita.stato !== 'in corso') {
                throw new HttpException(StatusCodes.BAD_REQUEST, 'La partita NON è in corso e non può essere abbandonata');
            }

            const id_vincitore = isPartitaControIA ? partita.id_giocatore1 : (partita.id_giocatore1 === id_giocatore ? partita.id_giocatore2 : partita.id_giocatore1);

            partita.stato = 'abbandonata';
            partita.id_vincitore = id_vincitore;
            await partita.save();

            // Recupera i dettagli del giocatore che abbandona la partita
            const giocatore = await Giocatore.findByPk(id_giocatore, { attributes: ['id_giocatore', 'nome', 'cognome', 'punteggio_totale'] });
            if (giocatore) {
                if (!giocatore.id_giocatore) {
                    throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Giocatore senza ID. Impossibile salvare.');
                }
                giocatore.punteggio_totale -= 0.5;
                await giocatore.save();
            }

            if (!isPartitaControIA && id_vincitore) {
                // Recupera i dettagli del vincitore
                const vincitore = await Giocatore.findByPk(id_vincitore, { attributes: ['id_giocatore', 'nome', 'cognome', 'punteggio_totale'] });
                if (vincitore) {
                    if (!vincitore.id_giocatore) {
                        throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Vincitore senza ID. Impossibile salvare.');
                    }
                    vincitore.punteggio_totale += 1;
                    await vincitore.save();

                    return {
                        success: true,
                        statusCode: StatusCodes.CREATED,
                        risultato: `Il giocatore ${giocatore?.nome} ${giocatore?.cognome} ha abbandonato la partita. Il giocatore ${vincitore.nome} ${vincitore.cognome} ha vinto e ha ricevuto 1 punto.`
                    };
                }
            }

            // Caso contro l'IA
            return {
                success: true,
                statusCode: StatusCodes.CREATED,
                risultato: `Il giocatore ${giocatore?.nome} ${giocatore?.cognome} ha abbandonato la partita contro l'IA ed ha perso 0.5 punti.`
            };
        } catch (error: unknown) {
            return GameStatusService.handleError(error, 'Errore durante l\'abbandono della partita');
        }
    }

    /**
     * Restituisce la classifica dei giocatori ordinata in base ai loro punteggi totali.
     *
     * @param {string} order - Ordinamento della classifica: 'ASC' per crescente o 'DESC' per decrescente.
     * @returns {Promise<object[]>} - Un array di giocatori con i loro nomi, cognomi e punteggi totali.
     * @throws {HttpException} - Lancia un'eccezione in caso di errore durante il recupero dei dati.
     */
    public static async playersRanking(order: string = 'ASC'): Promise<object[]> {
        try {
            const giocatori = await Giocatore.findAll({
                attributes: ['nome', 'cognome', 'punteggio_totale'],
                order: [['punteggio_totale', order]] // Ordinamento per punteggio totale
            });

            if (!giocatori || giocatori.length === 0) {
                throw new HttpException(StatusCodes.NOT_FOUND, 'Nessun giocatore trovato');
            }

            return giocatori;
        } catch (error: unknown) {
            return GameStatusService.handleError(error, 'Errore durante il recupero della classifica');
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

    public static async getGameDetails(id_partita: number): Promise<any> {
        const partita = await Partita.findByPk(id_partita, {
            attributes: ['id_giocatore1', 'id_giocatore2', 'id_vincitore', 'stato', 'tempo_totale', 'mosse_totali', 'data_inizio'],
        });

        if (!partita) {
            throw new HttpException(StatusCodes.NOT_FOUND, 'Partita non trovata');
        }

        // Se id_vincitore è null, controlliamo lo stato della partita
        if (partita.id_vincitore === null) {
            if (partita.stato === 'in corso') {
                throw new HttpException(StatusCodes.BAD_REQUEST, 'La partita è ancora in corso. Il certificato di vittoria non è disponibile.');
            } else if (partita.stato === 'completata' || partita.stato === 'abbandonata') {
                throw new HttpException(StatusCodes.BAD_REQUEST, 'La partita è stata completata o abbandonata contro IA, ma non è stata vinta da un giocatore. Nessun certificato disponibile.');
            }
        }

        // Recupera i dettagli di giocatore1 e giocatore2
        const giocatore1 = await Giocatore.findByPk(partita.id_giocatore1, { attributes: ['nome', 'cognome'] });
        const giocatore2 = partita.id_giocatore2 ? await Giocatore.findByPk(partita.id_giocatore2, { attributes: ['nome', 'cognome'] }) : null;

        if (!giocatore1 || (!giocatore2 && partita.id_giocatore2 !== null)) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Impossibile recuperare i dati dei giocatori');
        }

        // Recupera il vincitore
        const vincitore = partita.id_vincitore ? await Giocatore.findByPk(partita.id_vincitore, { attributes: ['nome', 'cognome'] }) : null;

        if (!vincitore) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Non vi è un vincitore per questa partita');
        }

        // Determina l'avversario correttamente confrontando l'ID del vincitore
        let avversario: any;
        if (vincitore.id_giocatore === partita.id_giocatore1) {
            avversario = giocatore2; // Vincitore è giocatore1, quindi avversario è giocatore2
        } else {
            avversario = giocatore1; // Vincitore è giocatore2, quindi avversario è giocatore1
        }

        // Prepara i dati del certificato
        const avversarioDettagli = avversario
            ? { nome: avversario.nome, cognome: avversario.cognome }
            : { nome: 'Intelligenza', cognome: 'Artificiale' };

        return {
            vincitore: `${vincitore.nome} ${vincitore.cognome}`,
            avversario: `${avversarioDettagli.nome} ${avversarioDettagli.cognome}`,
            tempo_totale: partita.tempo_totale,
            mosse_totali: partita.mosse_totali,
            data_inizio: partita.data_inizio // Aggiungi la data formattata ai dettagli della partita
        };
    }

    public static async getVictoryCertify(id_partita: number): Promise<Buffer> {
        const partita = await this.getGameDetails(id_partita);

        // Assicurati che data_inizio sia disponibile nei dettagli della partita
        if (!partita.data_inizio) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Data inizio non trovata.');
        }

        // Verifica che la data_inizio sia valida prima di formattarla
        const dataFormattata = partita.data_inizio
            ? format(new Date(partita.data_inizio), 'yyyy-MM-dd')  // Formatta la data
            : 'Data non disponibile';

        const fonts = {
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };

        const printer = new PdfPrinter(fonts);

        // Usa i dati ottenuti da getDettagliPartita
        const player1Name = partita.vincitore;
        const player2Name = partita.avversario;
        const totalMoves = partita.mosse_totali;

        // Converti il tempo totale da secondi a ore:minuti:secondi
        const gameDuration = convertSecondsToHMS(partita.tempo_totale);

        // Funzione per convertire secondi in ore:minuti:secondi
        function convertSecondsToHMS(seconds: number): string {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h}h ${m}m ${s}s`;
        }

        const docDefinition = {
            content: [
                { text: 'CERTIFICATO DI VITTORIA', style: 'header' },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'Data della partita:', style: 'boldText' }, dataFormattata], // Usa la data formattata
                            [{ text: 'Giocatore:', style: 'boldText' }, { text: player1Name }],
                            [{ text: 'Giocatore:', style: 'boldText' }, { text: player2Name }],
                            [{ text: 'Mosse totali:', style: 'boldText' }, { text: totalMoves }],
                            [{ text: 'Durata della partita:', style: 'boldText' }, { text: gameDuration }],
                            [{ text: 'Vincitore:', style: 'boldText' }, { text: player1Name }]
                        ]
                    },
                    layout: 'lightHorizontalLines', // Aggiunge bordi leggeri tra le righe
                },
                { text: 'Congratulazioni!', style: 'congratulations' }
            ],
            styles: {
                header: { fontSize: 22, bold: true },
                boldText: { fontSize: 12, bold: true },
                congratulations: { fontSize: 15, italics: true }
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        return new Promise<Buffer>((resolve, reject) => {
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (error) => reject(error));
            pdfDoc.end();
        });
    }
}

export default GameStatusService;