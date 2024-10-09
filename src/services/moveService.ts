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
import HttpException from "../helpers/errorHandler";

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);
const Mossa = initMossa(sequelize);
const MossaIA = initMossaIA(sequelize);

class MoveService {
    private static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return rank * 8 + file;
    }

    private static convertPositionBack(index: number): string {
        const file = String.fromCharCode('A'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }

    private static async verificaGiocatoreNellaPartita(id_partita: number, id_giocatore: number): Promise<void> {
        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw ErrorFactory.createError('NOT_FOUND', "Partita non trovata.");
        }
        if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore) {
            throw ErrorFactory.createError('FORBIDDEN', "Il giocatore non fa parte di questa partita.");
        }
    }

    public static async executeMove(id_partita: number, from: string, to: string, id_giocatore1: number) {
        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw ErrorFactory.createError('NOT_FOUND', "Giocatore non trovato.");
        }

        if (giocatore.token_residuo <= 0) {
            throw ErrorFactory.createError('UNAUTHORIZED', "Token terminati. Non puoi fare altre mosse.");
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
            console.error(`Tentativo di effettuare una mossa non valida da ${from} a ${to}`);
            throw ErrorFactory.createError('BAD_REQUEST', "Mossa non valida.");
        }

        try {
            const lastMove = await Mossa.findOne({
                where: { id_partita },
                order: [['numero_mossa', 'DESC']],
                attributes: ['from_position', 'to_position']
            });

            console.log("Ultima mossa trovata:", lastMove);

            if (lastMove && lastMove.from_position === from && lastMove.to_position === to) {
                console.log("Tentativo di ripetere la stessa mossa:", lastMove);
                throw ErrorFactory.createError('BAD_REQUEST', "Non puoi ripetere la stessa mossa consecutivamente.");
            }

            console.log("Esecuzione della mossa:", moveToMake);
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

            console.log("Aggiornamento della tavola con la nuova configurazione.");
            partita.tavola = JSON.stringify({ initialBoard: draughts.board });
            partita.mosse_totali = (partita.mosse_totali || 0) + 1;
            await partita.save();

            console.log("Tavola aggiornata e partita salvata con successo.");

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
                    data: new Date(),
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
        } catch (error) {
            if (error instanceof HttpException) {
                console.error("Errore HTTP durante la esecuzione della mossa:", error.message);
                throw error;
            } else if (error instanceof Error) {
                console.error("Errore generico durante la esecuzione della mossa:", error.message);
                throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore durante la esecuzione della mossa.');
            } else {
                console.error("Errore sconosciuto durante l'esecuzione della mossa");
                throw ErrorFactory.createError('INTERNAL_SERVER_ERROR', 'Errore sconosciuto durante la esecuzione della mossa.');
            }
        }
    }

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

    private static async deductMoveCost(id_giocatore1: number): Promise<void> {
        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw ErrorFactory.createError('NOT_FOUND', 'Giocatore non trovato.');
        }

        giocatore.token_residuo -= 0.0125;
        await giocatore.save();
    }

    public static async getMoveHistory(id_partita: number): Promise<any[]> {
        console.log(`Recupero dello storico delle mosse per la partita con ID: ${id_partita}`);

        const mosse = await Mossa.findAll({
            where: { id_partita },
            order: [['numero_mossa', 'ASC']]
        });

        if (mosse.length === 0) {
            console.log(`Nessuna mossa trovata per la partita con ID: ${id_partita}`);
            throw ErrorFactory.createError('NOT_FOUND', 'Nessuna mossa trovata per questa partita');
        }

        console.log(`Trovate ${mosse.length} mosse per la partita con ID: ${id_partita}`);

        const moveHistory = mosse.map(mossa => {
            const dataMossa = format(new Date(mossa.data), 'yyyy-MM-dd HH:mm:ss');
            return {
                numeroMossa: mossa.numero_mossa,
                origin: mossa.from_position,
                destination: mossa.to_position,
                dataMossa
            };
        });

        return moveHistory;
    }

    public static async exportToPDF(id_partita: number): Promise<Buffer> {
        console.log(`Esportazione dello storico delle mosse in formato PDF`);

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

        const docDefinition = {
            content: [
                { text: 'STORICO DELLE MOSSE', style: 'header' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*'],
                        body: [
                            ['Numero Mossa', 'Origine', 'Destinazione', 'Data Mossa'],
                            ...moveHistory.map(mossa => [
                                mossa.numeroMossa,
                                mossa.origin,
                                mossa.destination,
                                mossa.dataMossa
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
            pdfDoc.on('end', () => {
                console.log('PDF generato con successo');
                resolve(Buffer.concat(chunks));
            });
            pdfDoc.on('error', (error) => {
                console.error('Errore durante la generazione del PDF:', error);
                reject(error);
            });
            pdfDoc.end();
        });
    }
}

export default MoveService;
