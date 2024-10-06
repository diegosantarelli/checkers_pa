import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import initMossa from '../models/Mossa';
import initMossaIA from '../models/MossaIA';
import HttpException from "../helpers/errorHandler";
import { DraughtsPlayer, DraughtsSquare1D, DraughtsStatus } from 'rapid-draughts';
import { EnglishDraughts as Draughts, EnglishDraughtsComputerFactory as ComputerFactory } from 'rapid-draughts/english';

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

    private static async verificaGiocatoreNellaPartita(id_partita: number, id_giocatore: number): Promise<void> {
        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw new HttpException(404, "Partita non trovata.");
        }

        if (partita.id_giocatore1 !== id_giocatore && partita.id_giocatore2 !== id_giocatore) {
            throw new HttpException(403, "Il giocatore non fa parte di questa partita.");
        }
    }

    public static async executeMove(id_partita: number, from: string, to: string, id_giocatore1: number, ruolo: string) {
        if (ruolo !== 'utente') {
            throw new HttpException(403, "Solo gli utenti possono fare mosse. Gli admin non sono autorizzati.");
        }

        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw new HttpException(404, "Giocatore non trovato.");
        }

        // Controlla se l'utente ha token residui
        if (giocatore.token_residuo <= 0) {
            throw new HttpException(401, "Token terminati. Non puoi fare altre mosse.");
        }

        // Verifica se il giocatore fa parte della partita
        await MoveService.verificaGiocatoreNellaPartita(id_partita, id_giocatore1);

        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw new HttpException(404, "Partita non trovata.");
        }

        let savedData: { initialBoard: DraughtsSquare1D[] } | null;
        try {
            savedData = typeof partita.tavola === 'string' ? JSON.parse(partita.tavola) : partita.tavola;
        } catch (error) {
            throw new HttpException(500, "Errore nel parsing della tavola.");
        }

        const savedBoard = savedData?.initialBoard;
        if (!savedBoard || !Array.isArray(savedBoard)) {
            throw new HttpException(500, "La tavola salvata non è un array valido.");
        }

        const draughts = Draughts.setup();
        savedBoard.forEach((square, index) => {
            draughts.board[index] = square;
        });

        // Stampa le mosse disponibili convertite in notazione scacchistica
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
            throw new HttpException(400, "Mossa non valida.");
        }

        // Esegui la mossa del giocatore umano
        draughts.move(moveToMake);

        // Aggiorna la tavola nella partita
        partita.tavola = JSON.stringify({ initialBoard: draughts.board });
        await partita.save();

        // Registra la mossa
        await Mossa.create({
            numero_mossa: await Mossa.count({ where: { id_partita } }) + 1,
            tavola: JSON.stringify({ initialBoard: draughts.board }),
            pezzo: savedBoard[origin]?.piece?.king ? 'dama' : 'singolo',
            id_partita,
            id_giocatore: id_giocatore1,
            data: new Date(),
        });

        // Deduzione del costo della mossa
        await MoveService.deductMoveCost(id_giocatore1);

        // Determina il colore del pezzo basato sul giocatore
        const colorePezzo = savedBoard[origin]?.piece?.player === DraughtsPlayer.LIGHT ? 'bianco' : 'nero';

        // Descrizione della mossa del giocatore in italiano
        const moveDescription = `Hai mosso ${savedBoard[origin]?.piece?.king ? 'una dama' : 'un pezzo singolo'} di colore ${colorePezzo} da ${from} a ${to}.`;

        // Se c'è un'IA nella partita, esegui la sua mossa
        if (partita.livello_IA) {
            const aiMove = await MoveService.executeAiMove(draughts, partita.livello_IA);

            draughts.move(aiMove);

            // Aggiorna la tavola dopo la mossa dell'IA
            partita.tavola = JSON.stringify({ initialBoard: draughts.board });
            await partita.save();

            try {
                // Registra la mossa dell'IA nel modello MossaIA
                await MossaIA.create({
                    numero_mossa: await MossaIA.count({ where: { id_partita } }) + 1,
                    tavola: JSON.stringify({ initialBoard: draughts.board }),
                    pezzo: draughts.board[aiMove.origin]?.piece?.king ? 'dama' : 'singolo',
                    id_partita,
                    data: new Date(),
                });
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Errore durante la creazione della mossa IA:", error.message);
                    throw new HttpException(500, `Errore durante la registrazione della mossa IA: ${error.message}`);
                } else {
                    console.error("Errore sconosciuto durante la creazione della mossa IA:", error);
                    throw new HttpException(500, 'Errore sconosciuto durante la registrazione della mossa IA.');
                }
            }

            // Determina il colore del pezzo basato sul giocatore
            const colorePezzoIA = draughts.board[aiMove.origin]?.piece?.player === DraughtsPlayer.LIGHT ? 'bianco' : 'nero';

            // Descrizione della mossa dell'IA in italiano
            const aiMoveDescription = `L'IA ha mosso ${draughts.board[aiMove.origin]?.piece?.king ? 'una dama' : 'un pezzo singolo'} di colore ${colorePezzoIA} da ${MoveService.convertPositionBack(aiMove.origin)} a ${MoveService.convertPositionBack(aiMove.destination)}.`;

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
            throw new HttpException(404, 'Giocatore non trovato.');
        }

        giocatore.token_residuo -= 0.0125;
        await giocatore.save();
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

    // Funzione per convertire la posizione da indice numerico a notazione scacchistica (es. A2)
    private static convertPositionBack(index: number): string {
        const file = String.fromCharCode('A'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }
}

export default MoveService;