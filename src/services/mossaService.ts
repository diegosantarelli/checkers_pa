import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import initMossa from '../models/Mossa';
import initMossaIA from '../models/MossaIA';
import HttpException from "../helpers/errorHandler";
import { DraughtsPlayer, DraughtsSquare1D, DraughtsStatus } from 'rapid-draughts';
import { EnglishDraughts as Draughts, EnglishDraughtsComputerFactory as ComputerFactory } from 'rapid-draughts/english';
import { StatusCodes } from 'http-status-codes';

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);
const Mossa = initMossa(sequelize);
const MossaIA = initMossaIA(sequelize);

class MossaService {

    /**
     * Converte una posizione in notazione scacchistica (es. "A2") in un indice numerico.
     *
     * @param {string} position - La posizione da convertire.
     * @returns {number} - L'indice numerico corrispondente.
     */
    private static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return rank * 8 + file;
    }

    /**
     * Converte un indice numerico in notazione scacchistica (es. da 12 a "A2").
     *
     * @param {number} index - L'indice numerico da convertire.
     * @returns {string} - La notazione scacchistica corrispondente.
     */
    private static convertPositionBack(index: number): string {
        const file = String.fromCharCode('A'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }

    /**
     * Verifica se il giocatore fa parte della partita.
     *
     * @param {number} id_partita - L'ID della partita.
     * @param {number} id_giocatore - L'ID del giocatore.
     * @throws {HttpException} - Lancia un'eccezione se il giocatore non fa parte della partita.
     */
    private static async verificaGiocatoreNellaPartita(id_partita: number, id_giocatore: number): Promise<void> {
        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Partita non trovata.");
        }

        if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore) {
            throw new HttpException(StatusCodes.FORBIDDEN, "Il giocatore non fa parte di questa partita.");
        }
    }

    /**
     * Esegue la mossa di un giocatore nella partita.
     *
     * @param {number} id_partita - L'ID della partita.
     * @param {string} from - La posizione di origine in notazione scacchistica.
     * @param {string} to - La posizione di destinazione in notazione scacchistica.
     * @param {number} id_giocatore1 - L'ID del giocatore che effettua la mossa.
     * @param {string} ruolo - Il ruolo dell'utente (es. "utente").
     * @returns {Promise<object>} - Restituisce un oggetto contenente la descrizione della mossa e lo stato della partita.
     * @throws {HttpException} - Lancia un'eccezione in caso di errore (giocatore non autorizzato, partita non trovata, mossa non valida, ecc.).
     */
    public static async executeMove(id_partita: number, from: string, to: string, id_giocatore1: number, ruolo: string) {
        if (ruolo !== 'utente') {
            throw new HttpException(StatusCodes.FORBIDDEN, "Solo gli utenti possono fare mosse. Gli admin non sono autorizzati.");
        }

        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw new HttpException(StatusCodes.NOT_FOUND, "Giocatore non trovato.");
        }

        // Controlla se l'utente ha token residui
        if (giocatore.token_residuo <= 0) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, "Token terminati. Non puoi fare altre mosse.");
        }

        // Verifica se il giocatore è parte della partita
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

        // Stampa le mosse disponibili convertite in notazione scacchistica
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
            throw new HttpException(StatusCodes.BAD_REQUEST, "Mossa non valida.");
        }

        try {
            // Recupera l'ultima mossa
            const lastMove = await Mossa.findOne({
                where: { id_partita },
                order: [['numero_mossa', 'DESC']],
                attributes: ['from_position', 'to_position']
            });

            console.log("Ultima mossa trovata:", lastMove);

            // Confronta l'ultima mossa con la mossa attuale
            if (lastMove && lastMove.from_position === from && lastMove.to_position === to) {
                console.log("Tentativo di ripetere la stessa mossa:", lastMove);
                throw new HttpException(StatusCodes.BAD_REQUEST, "Non puoi ripetere la stessa mossa consecutivamente.");
            }

            // Esegui la mossa
            console.log("Esecuzione della mossa:", moveToMake);
            draughts.move(moveToMake);

            // Controlla se la partita è terminata
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

            // Aggiorna la tavola nella partita
            console.log("Aggiornamento della tavola con la nuova configurazione.");
            partita.tavola = JSON.stringify({ initialBoard: draughts.board });
            partita.mosse_totali = (partita.mosse_totali || 0) + 1;
            await partita.save();

            console.log("Tavola aggiornata e partita salvata con successo.");

            // Registra la mossa del giocatore
            await Mossa.create({
                numero_mossa: await Mossa.count({ where: { id_partita } }) + 1,
                tavola: JSON.stringify({ initialBoard: draughts.board }),
                from_position: from,  // Registra la posizione di origine
                to_position: to,      // Registra la posizione di destinazione
                pezzo: savedBoard[origin]?.piece?.king ? 'dama' : 'singolo',
                id_partita,
                id_giocatore: id_giocatore1,
                data: new Date(),
            });

            // Deduzione del costo della mossa
            await MossaService.deductMoveCost(id_giocatore1);

            // Descrizione della mossa
            const colorePezzo = savedBoard[origin]?.piece?.player === DraughtsPlayer.LIGHT ? 'bianco' : 'nero';
            const moveDescription = `Hai mosso ${savedBoard[origin]?.piece?.king ? 'una dama' : 'un pezzo singolo'} di colore ${colorePezzo} da ${from} a ${to}.`;

            // Se c'è un'IA nella partita, esegui la sua mossa
            if (partita.livello_IA) {
                const aiMove = await MossaService.executeAiMove(draughts, partita.livello_IA);

                draughts.move(aiMove);

                // Controlla se la partita è terminata dopo la mossa dell'IA
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

                // Aggiorna la tavola dopo la mossa dell'IA
                partita.tavola = JSON.stringify({ initialBoard: draughts.board });
                partita.mosse_totali += 1;
                await partita.save();

                // Registra la mossa dell'IA
                await MossaIA.create({
                    numero_mossa: await MossaIA.count({ where: { id_partita } }) + 1,
                    tavola: JSON.stringify({ initialBoard: draughts.board }),
                    pezzo: draughts.board[aiMove.origin]?.piece?.king ? 'dama' : 'singolo',
                    id_partita,
                    data: new Date(),
                });

                const colorePezzoIA = draughts.board[aiMove.origin]?.piece?.player === DraughtsPlayer.LIGHT ? 'bianco' : 'nero';
                const aiMoveDescription = `IA ha mosso ${draughts.board[aiMove.origin]?.piece?.king ? 'una dama' : 'un pezzo singolo'} di colore ${colorePezzoIA} da ${MossaService.convertPositionBack(aiMove.origin)} a ${MossaService.convertPositionBack(aiMove.destination)}.`;

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
                console.error("Errore HTTP durante l'esecuzione della mossa:", error.message);
                throw error;
            } else if (error instanceof Error) {
                console.error("Errore generico durante l'esecuzione della mossa:", error.message);
                throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore durante l\'esecuzione della mossa.');
            } else {
                console.error("Errore sconosciuto durante l'esecuzione della mossa");
                throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Errore sconosciuto durante l\'esecuzione della mossa.');
            }
        }
    }

    /**
     * Gestisce la fine della partita, assegnando il vincitore o determinando un pareggio.
     *
     * @param {any} draughts - L'istanza della partita di dama.
     * @param {any} partita - L'istanza della partita nel database.
     * @returns {object} - Restituisce il risultato della partita e la tavola aggiornata.
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
     * Esegue la mossa dell'IA in base al livello di difficoltà selezionato.
     *
     * @param {any} draughts - L'istanza della partita di dama.
     * @param {string} livelloIA - Il livello di difficoltà dell'IA (es. "facile", "normale", "difficile", "estrema").
     * @returns {Promise<any>} - La mossa selezionata dall'IA.
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
     * Deduce il costo di una mossa dai token rimanenti del giocatore.
     *
     * @param {number} id_giocatore1 - L'ID del giocatore a cui dedurre il costo della mossa.
     * @throws {HttpException} - Lancia un'eccezione se il giocatore non viene trovato.
     */
    private static async deductMoveCost(id_giocatore1: number): Promise<void> {
        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw new HttpException(StatusCodes.NOT_FOUND, 'Giocatore non trovato.');
        }

        giocatore.token_residuo -= 0.0125;
        await giocatore.save();
    }
}

export default MossaService;
