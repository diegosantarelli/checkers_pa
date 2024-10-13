import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import initMossa from '../models/Mossa';
import initMossaIA from '../models/MossaIA';
import ErrorFactory from '../factories/errorFactory';
import { DraughtsPlayer, DraughtsSquare1D, DraughtsStatus } from 'rapid-draughts';
import { EnglishDraughts as Draughts, EnglishDraughtsComputerFactory as ComputerFactory } from 'rapid-draughts/english';
import PdfPrinter from 'pdfmake';
import { format } from 'date-fns';

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);
const Mossa = initMossa(sequelize);
const MossaIA = initMossaIA(sequelize);


/**
 * @class MoveService
 * @description Servizio per la gestione delle mosse nel gioco della dama, inclusa la gestione delle mosse del giocatore,
 * dell'IA, la convalida, il salvataggio e l'esportazione dello storico delle mosse.
 */
class MoveService {
    /**
     * Converte una posizione in formato notazione scacchistica (es. "A1") in un indice numerico per la scacchiera.
     *
     * @param {string} position - La posizione in notazione scacchistica (es. "A1").
     * @returns {number} - L'indice della posizione corrispondente.
     */
    private static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return rank * 8 + file;
    }

    /**
     * Converte un indice numerico della scacchiera in una posizione in notazione scacchistica.
     *
     * @param {number} index - L'indice della scacchiera.
     * @returns {string} - La posizione corrispondente in notazione scacchistica (es. "A1").
     */
    private static convertPositionBack(index: number): string {
        const file = String.fromCharCode('A'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }

    /**
     * Verifica se il giocatore fa parte della partita specificata.
     *
     * @param {number} id_partita - L'ID della partita.
     * @param {number} id_giocatore - L'ID del giocatore.
     * @throws {HttpException} - Se la partita non esiste o il giocatore non fa parte della partita.
     */
    private static async verificaGiocatoreNellaPartita(id_partita: number, id_giocatore: number): Promise<void> {
        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw ErrorFactory.createError('NOT_FOUND', "Partita non trovata.");
        }
        if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore) {
            throw ErrorFactory.createError('FORBIDDEN', "Il giocatore non fa parte di questa partita.");
        }
    }

    /**
     * Esegue una mossa nel gioco della dama.
     *
     * @param {number} id_partita - L'ID della partita.
     * @param {string} from - La posizione di origine in notazione scacchistica (es. "A1").
     * @param {string} to - La posizione di destinazione in notazione scacchistica (es. "B2").
     * @param {number} id_giocatore1 - L'ID del giocatore che esegue la mossa.
     * @returns {Promise<object>} - Un oggetto che descrive la mossa eseguita e lo stato della partita.
     * @throws {HttpException} - Se la mossa non è valida, il giocatore non è autorizzato o ci sono errori
     * nel salvataggio della partita.
     */
    public static async executeMove(id_partita: number, from: string, to: string, id_giocatore1: number) {
        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw ErrorFactory.createError('NOT_FOUND', "Giocatore non trovato.");
        }

        await MoveService.verificaGiocatoreNellaPartita(id_partita, id_giocatore1);

        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw ErrorFactory.createError('NOT_FOUND', "Partita non trovata.");
        }

        if (partita.stato !== "in corso") {
            throw ErrorFactory.createError('CONFLICT', "Non puoi effettuare una mossa in una partita che non è in corso.");
        }

        let savedData: { initialBoard: DraughtsSquare1D[] } | null;
        try {
            savedData = typeof partita.tavola === 'string' ? JSON.parse(partita.tavola) : partita.tavola;
        } catch (error) {
            throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', "Errore nel parsing della tavola.");
        }

        const savedBoard = savedData?.initialBoard;
        if (!savedBoard || !Array.isArray(savedBoard)) {
            throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', "La tavola salvata non è un array valido.");
        }

        const draughts = Draughts.setup();
        savedBoard.forEach((square, index) => {
            draughts.board[index] = square;
        });

        console.log("Mosse disponibili per il giocatore attuale:");
        const convertedMoves = draughts.moves.map(move => ({
            origin: MoveService.convertPositionBack(move.origin),
            destination: MoveService.convertPositionBack(move.destination),
            captures: move.captures.map(capture => MoveService.convertPositionBack(capture))
        }));
        console.table(convertedMoves);

        const origin = MoveService.convertPosition(from);
        const destination = MoveService.convertPosition(to);

        const validMoves = draughts.moves;
        const moveToMake = validMoves.find(move => move.origin === origin && move.destination === destination);

        if (!moveToMake) {
            throw ErrorFactory.createError('BAD_REQUEST', "Mossa non valida.");
        }

        const lastMove = await Mossa.findOne({
            where: { id_partita },
            order: [['numero_mossa', 'DESC']],
            attributes: ['from_position', 'to_position']
        });

        if (lastMove && lastMove.from_position === from && lastMove.to_position === to) {
            throw ErrorFactory.createError('BAD_REQUEST', "Non puoi ripetere la stessa mossa consecutivamente.");
        }

        draughts.move(moveToMake);

        if ((draughts.status as DraughtsStatus) === DraughtsStatus.LIGHT_WON ||
            (draughts.status as DraughtsStatus) === DraughtsStatus.DARK_WON ||
            (draughts.status as DraughtsStatus) === DraughtsStatus.DRAW) {
            const gameOverResult = MoveService.handleGameOver(draughts, partita);
            return {
                message: gameOverResult.message,
                id_partita: partita.id_partita,
                tavola: gameOverResult.tavola,
                moveDescription: `La partita è terminata: ${gameOverResult.message}`,
            };
        }

        partita.tavola = JSON.stringify({ initialBoard: draughts.board });
        partita.mosse_totali = (partita.mosse_totali || 0) + 1;
        await partita.save();

        await Mossa.create({
            numero_mossa: await Mossa.count({ where: { id_partita } }) + 1,
            tavola: JSON.stringify({ initialBoard: draughts.board }),
            from_position: from,
            to_position: to,
            pezzo: savedBoard[origin]?.piece?.king ? 'dama' : 'singolo',
            id_partita,
            id_giocatore: id_giocatore1,
            data: new Date(),
        });

        await MoveService.deductMoveCost(id_giocatore1);

        const colorePezzo = savedBoard[origin]?.piece?.player === DraughtsPlayer.LIGHT ? 'bianco' : 'nero';
        const moveDescription = `Hai mosso ${savedBoard[origin]?.piece?.king ? 'una dama' : 'un pezzo singolo'} di colore ${colorePezzo} da ${from} a ${to}.`;

        if (partita.livello_IA) {
            // Deduce il costo sia della mossa del giocatore che di quella dell'IA
            await MoveService.deductMoveCost(id_giocatore1, 2); // Deduce il costo di due mosse

            const aiMove = await MoveService.executeAiMove(draughts, partita.livello_IA);

            draughts.move(aiMove);

            if ((draughts.status as DraughtsStatus) === DraughtsStatus.LIGHT_WON ||
                (draughts.status as DraughtsStatus) === DraughtsStatus.DARK_WON ||
                (draughts.status as DraughtsStatus) === DraughtsStatus.DRAW) {
                const gameOverResult = MoveService.handleGameOver(draughts, partita);
                return {
                    message: gameOverResult.message,
                    id_partita: partita.id_partita,
                    tavola: gameOverResult.tavola,
                    moveDescription: `La partita è terminata: ${gameOverResult.message}`,
                };
            }

            partita.tavola = JSON.stringify({ initialBoard: draughts.board });
            partita.mosse_totali += 1;
            await partita.save();

            await MossaIA.create({
                numero_mossa: await MossaIA.count({ where: { id_partita } }) + 1,
                tavola: JSON.stringify({ initialBoard: draughts.board }),
                pezzo: draughts.board[aiMove.origin]?.piece?.king ? 'dama' : 'singolo',
                id_partita,
                from_position: MoveService.convertPositionBack(aiMove.origin),  // Assicurati di settare questo
                to_position: MoveService.convertPositionBack(aiMove.destination), // Assicurati di settare anche questo
                data: new Date(),
            }).catch(err => {
                console.error('Errore nel salvataggio della mossa IA:', {
                    tavola: JSON.stringify({ initialBoard: draughts.board }),
                    pezzo: draughts.board[aiMove.origin]?.piece?.king ? 'dama' : 'singolo',
                    id_partita,
                    data: new Date(),
                    error: err
                });
                throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore durante il salvataggio della mossa IA');
            });

            const colorePezzoIA = draughts.board[aiMove.origin]?.piece?.player === DraughtsPlayer.LIGHT ? 'bianco' : 'nero';
            const aiMoveDescription = `IA ha mosso ${draughts.board[aiMove.origin]?.piece?.king ? 'una dama' : 'un pezzo singolo'} di colore ${colorePezzoIA} da ${MoveService.convertPositionBack(aiMove.origin)} a ${MoveService.convertPositionBack(aiMove.destination)}.`;

            return {
                message: "Mossa eseguita con successo",
                id_partita: partita.id_partita,
                tavola: draughts.board,
                moveDescription: `${moveDescription} ${aiMoveDescription}`
            };
        }

        return {
            message: "Mossa eseguita con successo",
            id_partita: partita.id_partita,
            tavola: draughts.board,
            moveDescription
        };
    }

    /**
     * Gestisce la fine della partita, assegnando il vincitore o dichiarando un pareggio.
     *
     * @param {any} draughts - L'istanza del gioco della dama.
     * @param {any} partita - L'istanza della partita.
     * @returns {object} - Un oggetto contenente il messaggio di fine partita e la tavola aggiornata.
     */
    private static handleGameOver(draughts: any, partita: any) {
        let risultato;
        if (draughts.status === DraughtsStatus.LIGHT_WON) {
            partita.id_vincitore = partita.id_giocatore1;
            risultato = 'Il giocatore 1 ha vinto!';
        } else if (draughts.status === DraughtsStatus.DARK_WON) {
            partita.id_vincitore = partita.id_giocatore2;
            risultato = 'Il giocatore 2 ha vinto!';
        } else {
            risultato = 'Partita terminata in pareggio!';
        }

        partita.stato = 'completata';
        partita.save();

        return {
            message: risultato,
            tavola: draughts.board,
        };
    }

    /**
     * Esegue la mossa dell'IA basata sul livello di difficoltà.
     *
     * @param {any} draughts - L'istanza del gioco della dama.
     * @param {string} livelloIA - Il livello di difficoltà dell'IA.
     * @returns {Promise<any>} - La mossa dell'IA.
     */
    private static async executeAiMove(draughts: any, livelloIA: string) {
        let ai;
        switch (livelloIA) {
            case "facile":
                ai = ComputerFactory.random();
                break;
            case "normale":
                ai = ComputerFactory.alphaBeta({ maxDepth: 3 });
                break;
            case "difficile":
                ai = ComputerFactory.alphaBeta({ maxDepth: 5 });
                break;
            case "estrema":
                ai = ComputerFactory.alphaBeta({ maxDepth: 7 });
                break;
            default:
                ai = ComputerFactory.random();
                break;
        }

        const aiMove = await ai(draughts);
        return aiMove;
    }

    /**
     * Deduce il costo di una mossa dal saldo di token del giocatore.
     *
     * @param {number} id_giocatore1 - L'ID del giocatore che ha effettuato la mossa.
     * @returns {Promise<void>} - Effettua la deduzione del costo della mossa.
     * @throws {HttpException} - Se il giocatore non viene trovato o ci sono errori nel salvataggio.
     */
    private static async deductMoveCost(id_giocatore1: number, numberOfMoves: number = 1): Promise<void> {
        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw ErrorFactory.createError('NOT_FOUND', 'Giocatore non trovato.');
        }

        const totalDeduction = 0.0125 * numberOfMoves;
        giocatore.token_residuo -= totalDeduction;

        await giocatore.save();
    }

    /**
     * Recupera lo storico delle mosse di una partita.
     *
     * @param {number} id_partita - L'ID della partita.
     * @returns {Promise<object[]>} - Un array contenente lo storico delle mosse.
     * @throws {HttpException} - Se nessuna mossa viene trovata per la partita.
     */
    public static async getMoveHistory(id_partita: number): Promise<any[]> {
        // Trova tutte le mosse dei giocatori umani
        const mosseGiocatori = await Mossa.findAll({
            where: { id_partita },
            order: [['numero_mossa', 'ASC']]
        });

        // Trova tutte le mosse dell'IA
        const mosseIA = await MossaIA.findAll({
            where: { id_partita },
            attributes: ['numero_mossa', 'from_position', 'to_position', 'data'], // Includi esplicitamente gli attributi
            order: [['numero_mossa', 'ASC']]
        });

        // Se non ci sono mosse, restituisci un errore
        if (mosseGiocatori.length === 0 && mosseIA.length === 0) {
            throw ErrorFactory.createError('NOT_FOUND', 'Nessuna mossa trovata per questa partita');
        }

        // Combina le mosse dei giocatori umani e dell'IA in un singolo array
        const tutteLeMosse = [
            ...mosseGiocatori.map(mossa => {
                const dataMossa = format(new Date(mossa.data), 'yyyy-MM-dd HH:mm:ss');
                return {
                    numeroMossa: mossa.numero_mossa,
                    origin: mossa.from_position,
                    destination: mossa.to_position,
                    dataMossa,
                    tipo: 'Giocatore'
                };
            }),
            ...mosseIA.map(mossa => {
                const dataMossa = format(new Date(mossa.data), 'yyyy-MM-dd HH:mm:ss');
                return {
                    numeroMossa: mossa.numero_mossa,
                    origin: mossa.from_position,
                    destination: mossa.to_position,
                    dataMossa,
                    tipo: 'IA'
                };
            })
        ];

        // Ordina le mosse in base al numero di mossa
        tutteLeMosse.sort((a, b) => a.numeroMossa - b.numeroMossa);

        return tutteLeMosse;
    }

    /**
     * Esporta lo storico delle mosse di una partita in formato PDF.
     *
     * @param {number} id_partita - L'ID della partita.
     * @returns {Promise<Buffer>} - Un buffer contenente il file PDF con lo storico delle mosse.
     * @throws {HttpException} - Se ci sono errori durante la generazione del PDF.
     */
    /**
     * Esporta lo storico delle mosse di una partita in formato PDF.
     *
     * @param {number} id_partita - L'ID della partita.
     * @returns {Promise<Buffer>} - Un buffer contenente il file PDF con lo storico delle mosse.
     * @throws {HttpException} - Se ci sono errori durante la generazione del PDF.
     */
    public static async exportToPDF(id_partita: number): Promise<Buffer> {
        const moveHistory = await this.getMoveHistory(id_partita);

        const fonts = {
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };
        const printer = new PdfPrinter(fonts);

        // Aggiorniamo la definizione del documento per includere il tipo di mossa
        const docDefinition = {
            content: [
                { text: `Storico delle mosse per la partita con id: ${id_partita}`, style: 'header' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*', '*'],  // Aggiungi una colonna in più per il tipo di mossa
                        body: [
                            ['Numero Mossa', 'Origine', 'Destinazione', 'Data Mossa', 'Tipo'],  // Aggiungi l'intestazione per il tipo
                            ...moveHistory.map(mossa => [
                                mossa.numeroMossa,
                                mossa.origin,
                                mossa.destination,
                                mossa.dataMossa,
                                mossa.tipo
                            ])
                        ]
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true }
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

export default MoveService;
