import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import initMossa from '../models/Mossa';
import HttpException from "../helpers/errorHandler";
import { DraughtsPlayer, DraughtsSquare1D } from 'rapid-draughts';
import { EnglishDraughts as Draughts } from 'rapid-draughts/english';

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);
const Mossa = initMossa(sequelize);

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
        // Controlla il ruolo dell'utente: solo gli utenti normali possono fare mosse
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

        console.log("Tavola salvata (raw):", partita.tavola);

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

        const origin = MoveService.convertPosition(from);
        const destination = MoveService.convertPosition(to);

        const validMoves = draughts.moves;
        console.log("Mosse legali disponibili:", validMoves);

        const moveToMake = validMoves.find(move => move.origin === origin && move.destination === destination);

        if (!moveToMake) {
            throw new HttpException(400, "Mossa non valida.");
        }

        draughts.move(moveToMake);

        // Determina il tipo di pezzo e se è una dama o un pezzo singolo
        const pezzoMossa = savedBoard[origin]?.piece?.king ? 'dama' : 'singolo';
        const tipoPezzo = pezzoMossa;

        partita.tavola = JSON.stringify({ initialBoard: draughts.board });
        await partita.save();

        try {
            const numeroMossePrecedenti = await Mossa.count({ where: { id_partita } });

            await Mossa.create({
                numero_mossa: numeroMossePrecedenti + 1,
                tavola: JSON.stringify({ initialBoard: draughts.board }),
                pezzo: pezzoMossa,
                tipo_pezzo: tipoPezzo,
                id_partita,
                id_giocatore: id_giocatore1,
                data: new Date(),
            });

            console.log("Mossa registrata con successo");
        } catch (error) {
            if (error instanceof Error) {
                console.error("Errore durante la creazione della mossa:", error.message);
            } else {
                console.error("Errore sconosciuto durante la creazione della mossa:", error);
            }
            throw new HttpException(500, "Errore durante la registrazione della mossa.");
        }

        // Deduzione del costo della mossa
        await MoveService.deductMoveCost(id_giocatore1);

        return {
            message: "Mossa eseguita con successo",
            id_partita: partita.id_partita,
            tavola: draughts.board
        };
    }

    private static async deductMoveCost(id_giocatore1: number): Promise<void> {
        const giocatore = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore) {
            throw new HttpException(404, 'Giocatore non trovato.');
        }

        giocatore.token_residuo -= 0.0125;
        await giocatore.save();
    }
}

export default MoveService;