import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import initMossa from '../models/Mossa';
import initMossaIA from '../models/MossaIA';
import HttpException from "../helpers/errorHandler";
import { DraughtsPlayer, DraughtsSquare1D, DraughtsStatus } from 'rapid-draughts';
import { EnglishDraughts as Draughts, EnglishDraughtsComputerFactory as ComputerFactory } from 'rapid-draughts/english';
import { StatusCodes } from 'http-status-codes';
import PdfPrinter from 'pdfmake';

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);
const Mossa = initMossa(sequelize);
const MossaIA = initMossaIA(sequelize);

class MossaService {
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
            throw new HttpException(StatusCodes.NOT_FOUND, "Partita non trovata.");
        }
        if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore) {
            throw new HttpException(StatusCodes.FORBIDDEN, "Il giocatore non fa parte di questa partita.");
        }
    }

    public static async executeMove(id_partita: number, from: string, to: string, id_giocatore1: number, ruolo: string) {
        if (ruolo !== 'utente') {
            throw new HttpException(StatusCodes.FORBIDDEN, "Solo gli utenti possono fare mosse. Gli admin non sono autorizzati.");
        }

        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Giocatore non trovato.");
        }

        if (giocatore.token_residuo <= 0) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Token terminati. Non puoi fare altre mosse.");
        }

        await MossaService.verificaGiocatoreNellaPartita(id_partita, id_giocatore1);

        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Partita non trovata.");
        }

        let savedData: { initialBoard: DraughtsSquare1D[] } | null;
        try {
            savedData = typeof partita.tavola === 'string' ? JSON.parse(partita.tavola) : partita.tavola;
        } catch (error) {
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, "Errore nel parsing della tavola.");
        }

        const savedBoard = savedData?.initialBoard;
        if (!savedBoard || !Array.isArray(savedBoard)) {
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, "La tavola salvata non è un array valido.");
        }

        const draughts = Draughts.setup();
        savedBoard.forEach((square, index) => {
            draughts.board[index] = square;
        });

        console.log("Mosse disponibili per il giocatore attuale:");
        const convertedMoves = draughts.moves.map(move => ({
            origin: MossaService.convertPositionBack(move.origin),
            destination: MossaService.convertPositionBack(move.destination),
            captures: move.captures.map(capture => MossaService.convertPositionBack(capture))
        }));
        console.table(convertedMoves);

        const origin = MossaService.convertPosition(from);
        const destination = MossaService.convertPosition(to);

        const validMoves = draughts.moves;
        const moveToMake = validMoves.find(move => move.origin === origin && move.destination === destination);

        if (!moveToMake) {
            console.error(`Tentativo di effettuare una mossa non valida da ${from} a ${to}`);
            throw new HttpException(StatusCodes.BAD_REQUEST, "Mossa non valida.");
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
                throw new HttpException(StatusCodes.BAD_REQUEST, "Non puoi ripetere la stessa mossa consecutivamente.");
            }

            console.log("Esecuzione della mossa:", moveToMake);
            draughts.move(moveToMake);

            if ((draughts.status as DraughtsStatus) === DraughtsStatus.LIGHT_WON ||
                (draughts.status as DraughtsStatus) === DraughtsStatus.DARK_WON ||
                (draughts.status as DraughtsStatus) === DraughtsStatus.DRAW) {
                const gameOverResult = MossaService.handleGameOver(draughts, partita);
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

            await MossaService.deductMoveCost(id_giocatore1);

            const colorePezzo = savedBoard[origin]?.piece?.player === DraughtsPlayer.LIGHT ? 'bianco' : 'nero';
            const moveDescription = `Hai mosso ${savedBoard[origin]?.piece?.king ? 'una dama' : 'un pezzo singolo'} di colore ${colorePezzo} da ${from} a ${to}.`;

            return {
                message: "Mossa eseguita con successo",
                id_partita: partita.id_partita,
                tavola: draughts.board,
                moveDescription
            };
        } catch (error) {
            console.error("Errore durante l'esecuzione della mossa:", error);
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, "Errore durante l'esecuzione della mossa.");
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
            throw new HttpException(StatusCodes.NOT_FOUND, 'Giocatore non trovato.');
        }

        giocatore.token_residuo -= 0.0125;
        await giocatore.save();
    }

    public static async getMoveHistory(id_partita: number): Promise<any[]> {
        console.log(`Recupero dello storico delle mosse per la partita con ID: ${id_partita}`);

        // Trova tutte le mosse associate alla partita
        const mosse = await Mossa.findAll({
            where: { id_partita },
            order: [['numero_mossa', 'ASC']] // Ordina le mosse in ordine di numero_mossa
        });

        if (mosse.length === 0) {
            console.log(`Nessuna mossa trovata per la partita con ID: ${id_partita}`);
            throw new Error('Nessuna mossa trovata per questa partita');
        }

        console.log(`Trovate ${mosse.length} mosse per la partita con ID: ${id_partita}`);

        // Ricrea la configurazione della partita usando Draughts, ma senza applicare le mosse
        const draughts = Draughts.setup();

        // Ottieni lo stato iniziale della tavola (senza applicare le mosse)
        const boardStates = mosse.map((mossa, index) => {
            return {
                numeroMossa: mossa.numero_mossa,
                origin: mossa.from_position,
                destination: mossa.to_position,
                board: draughts.board // Stato della tavola attuale
            };
        });

        return boardStates;
    }

    private static convertPositionToIndex(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return rank * 4 + Math.floor(file / 2);
    }

    public static async exportToPDF(moveHistory: any[]): Promise<Buffer> {
        console.log(`Esportazione dello storico delle mosse in formato PDF`);

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
                { text: 'Storico delle Mosse', style: 'header' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*'],
                        body: [
                            ['Numero Mossa', 'Origine', 'Destinazione', 'Catture'],
                            ...moveHistory.map(mossa => [
                                mossa.numeroMossa,
                                mossa.origin,
                                mossa.destination,
                                Array.isArray(mossa.captures) ? mossa.captures.join(', ') : ''
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

export default MossaService;