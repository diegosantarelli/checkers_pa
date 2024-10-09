import { Partita, Giocatore } from '../models';
import ErrorFactory from '../factories/errorFactory';
import { StatusCodes } from 'http-status-codes';
import PdfPrinter from 'pdfmake';
import { format } from 'date-fns';
import HttpException from "../helpers/errorHandler";

/**
 * Servizio per la gestione dello stato delle partite, inclusa la valutazione e l'abbandono delle partite.
 */
class GameStatusService {
    // Metodo esistente: valutaPartita
    public static async evaluateGame(id_partita: number, id_giocatore: number): Promise<{ success: boolean, statusCode: number, risultato: string }> {
        try {
            const partita = await Partita.findByPk(id_partita);

            if (!partita) {
                throw ErrorFactory.createError('NOT_FOUND', 'Partita non trovata');
            }

            let risultato = '';

            if (partita.stato === 'completata' && partita.id_vincitore) {
                const vincitore = await Giocatore.findByPk(partita.id_vincitore);

                if (!vincitore) {
                    throw ErrorFactory.createError('NOT_FOUND', 'Vincitore non trovato');
                }

                risultato = `La partita è stata vinta da ${vincitore.nome}`;
            } else if (partita.stato === 'abbandonata') {
                const giocatore = await Giocatore.findByPk(id_giocatore);

                if (!giocatore) {
                    throw ErrorFactory.createError('NOT_FOUND', 'Giocatore non trovato');
                }

                risultato = `${giocatore.nome} ${giocatore.cognome} ha abbandonato la partita`;
            } else if (partita.stato === 'in corso') {
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
                throw ErrorFactory.createError('NOT_FOUND', 'Partita non trovata');
            }

            const isPartitaControIA = partita.id_giocatore2 === null && partita.livello_IA !== null;

            if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore && !isPartitaControIA) {
                throw ErrorFactory.createError('FORBIDDEN', 'Il giocatore non fa parte di questa partita');
            }

            if (partita.stato !== 'in corso') {
                throw ErrorFactory.createError('BAD_REQUEST', 'La partita NON è in corso e non può essere abbandonata');
            }

            const id_vincitore = isPartitaControIA ? partita.id_giocatore1 : (partita.id_giocatore1 === id_giocatore ? partita.id_giocatore2 : partita.id_giocatore1);

            partita.stato = 'abbandonata';
            partita.id_vincitore = id_vincitore;
            await partita.save();

            const giocatore = await Giocatore.findByPk(id_giocatore, { attributes: ['id_giocatore', 'nome', 'cognome', 'punteggio_totale'] });
            if (giocatore) {
                giocatore.punteggio_totale -= 0.5;
                await giocatore.save();
            }

            if (!isPartitaControIA && id_vincitore) {
                const vincitore = await Giocatore.findByPk(id_vincitore, { attributes: ['id_giocatore', 'nome', 'cognome', 'punteggio_totale'] });
                if (vincitore) {
                    vincitore.punteggio_totale += 1;
                    await vincitore.save();

                    return {
                        success: true,
                        statusCode: StatusCodes.CREATED,
                        risultato: `Il giocatore ${giocatore?.nome} ${giocatore?.cognome} ha abbandonato la partita. Il giocatore ${vincitore.nome} ${vincitore.cognome} ha vinto e ha ricevuto 1 punto.`
                    };
                }
            }

            return {
                success: true,
                statusCode: StatusCodes.CREATED,
                risultato: `Il giocatore ${giocatore?.nome} ${giocatore?.cognome} ha abbandonato la partita contro l'IA ed ha perso 0.5 punti.`
            };
        } catch (error: unknown) {
            return GameStatusService.handleError(error, 'Errore durante l\'abbandono della partita');
        }
    }

    public static async playersRanking(order: string = 'ASC'): Promise<object[]> {
        try {
            const giocatori = await Giocatore.findAll({
                attributes: ['nome', 'cognome', 'punteggio_totale'],
                order: [['punteggio_totale', order]]
            });

            if (!giocatori || giocatori.length === 0) {
                throw ErrorFactory.createError('NOT_FOUND', 'Nessun giocatore trovato');
            }

            return giocatori;
        } catch (error: unknown) {
            return GameStatusService.handleError(error, 'Errore durante il recupero della classifica');
        }
    }

    public static async getGameDetails(id_partita: number): Promise<any> {
        const partita = await Partita.findByPk(id_partita, {
            attributes: ['id_giocatore1', 'id_giocatore2', 'id_vincitore', 'stato', 'tempo_totale', 'mosse_totali', 'data_inizio'],
        });

        if (!partita) {
            throw ErrorFactory.createError('NOT_FOUND', 'Partita non trovata');
        }

        if (partita.id_vincitore === null) {
            if (partita.stato === 'in corso') {
                throw ErrorFactory.createError('BAD_REQUEST', 'La partita è ancora in corso. Il certificato di vittoria non è disponibile.');
            } else if (partita.stato === 'completata' || partita.stato === 'abbandonata') {
                throw ErrorFactory.createError('BAD_REQUEST', 'La partita è stata completata o abbandonata contro IA, ma non è stata vinta da un giocatore. Nessun certificato disponibile.');
            }
        }

        const giocatore1 = await Giocatore.findByPk(partita.id_giocatore1, { attributes: ['nome', 'cognome'] });
        const giocatore2 = partita.id_giocatore2 ? await Giocatore.findByPk(partita.id_giocatore2, { attributes: ['nome', 'cognome'] }) : null;

        if (!giocatore1 || (!giocatore2 && partita.id_giocatore2 !== null)) {
            throw ErrorFactory.createError('BAD_REQUEST', 'Impossibile recuperare i dati dei giocatori');
        }

        const vincitore = partita.id_vincitore ? await Giocatore.findByPk(partita.id_vincitore, { attributes: ['nome', 'cognome'] }) : null;

        if (!vincitore) {
            throw ErrorFactory.createError('BAD_REQUEST', 'Non vi è un vincitore per questa partita');
        }

        let avversario: any;
        if (vincitore.id_giocatore === partita.id_giocatore1) {
            avversario = giocatore2;
        } else {
            avversario = giocatore1;
        }

        const avversarioDettagli = avversario
            ? { nome: avversario.nome, cognome: avversario.cognome }
            : { nome: 'Intelligenza', cognome: 'Artificiale' };

        return {
            vincitore: `${vincitore.nome} ${vincitore.cognome}`,
            avversario: `${avversarioDettagli.nome} ${avversarioDettagli.cognome}`,
            tempo_totale: partita.tempo_totale,
            mosse_totali: partita.mosse_totali,
            data_inizio: partita.data_inizio
        };
    }

    public static async getVictoryCertify(id_partita: number): Promise<Buffer> {
        const partita = await this.getGameDetails(id_partita);

        const dataFormattata = partita.data_inizio
            ? format(new Date(partita.data_inizio), 'yyyy-MM-dd')
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

        const player1Name = partita.vincitore;
        const player2Name = partita.avversario;
        const totalMoves = partita.mosse_totali;

        const gameDuration = convertSecondsToHMS(partita.tempo_totale);

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
                            [{ text: 'Data della partita:', style: 'boldText' }, dataFormattata],
                            [{ text: 'Giocatore:', style: 'boldText' }, { text: player1Name }],
                            [{ text: 'Avversario:', style: 'boldText' }, { text: player2Name }],
                            [{ text: 'Mosse totali:', style: 'boldText' }, { text: totalMoves }],
                            [{ text: 'Durata della partita:', style: 'boldText' }, { text: gameDuration }],
                            [{ text: 'Vincitore:', style: 'boldText' }, { text: player1Name }]
                        ]
                    },
                    layout: 'lightHorizontalLines',
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

    private static handleError(error: unknown, defaultMessage: string): never {
        if (error instanceof HttpException) {
            throw error;
        }
        if (error instanceof Error) {
            throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', `${defaultMessage}: ${error.message}`);
        } else {
            throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', defaultMessage);
        }
    }
}

export default GameStatusService;
