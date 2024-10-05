import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import HttpException from "../helpers/errorHandler";
import { DraughtsPlayer, DraughtsSquare1D } from 'rapid-draughts';
import { EnglishDraughts as Draughts } from 'rapid-draughts/english';

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);

class MoveService {
    // Funzione di conversione da coordinate scacchistiche (es. "B6") a indici numerici
    private static convertPosition(position: string): number {
        const file = position.charCodeAt(0) - 'A'.charCodeAt(0); // Converti la lettera in un numero (A -> 0, B -> 1, etc.)
        const rank = 8 - parseInt(position[1]); // Converti il numero in una riga (1 -> 7, 2 -> 6, etc.)
        return rank * 8 + file; // Converti in indice di un array 1D
    }

    public static async executeMove(id_partita: number, from: string, to: string, id_giocatore1: number) {
        // Recupera la partita dal database
        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw new HttpException(404, "Partita non trovata.");
        }

        // Log della tavola salvata prima di analizzarla
        console.log("Tavola salvata (raw):", partita.tavola);

        // Recupera e verifica che la tavola sia un oggetto JSON valido e deserializzala
        let savedData: { initialBoard: DraughtsSquare1D[] } | null;
        try {
            savedData = typeof partita.tavola === 'string' ? JSON.parse(partita.tavola) : partita.tavola;
        } catch (error) {
            throw new HttpException(500, "Errore nel parsing della tavola.");
        }

        // Verifica se savedData ha la proprietà initialBoard
        const savedBoard = savedData?.initialBoard;
        if (!savedBoard || !Array.isArray(savedBoard)) {
            throw new HttpException(500, "La tavola salvata non è un array valido.");
        }

        // Inizializza il gioco partendo dalla configurazione salvata
        const draughts = Draughts.setup();

        // Ripristina lo stato della scacchiera utilizzando i dati salvati
        savedBoard.forEach((square, index) => {
            draughts.board[index] = square; // Ripristina ogni quadrato nella posizione corretta
        });

        // Converti le coordinate da scacchistiche a numeriche
        const origin = MoveService.convertPosition(from);
        const destination = MoveService.convertPosition(to);

        // Log delle mosse legali
        const validMoves = draughts.moves;
        console.log("Mosse legali disponibili:", validMoves);

        // Verifica se la mossa è valida confrontando con le mosse legali
        const moveToMake = validMoves.find(move => move.origin === origin && move.destination === destination);

        if (!moveToMake) {
            throw new HttpException(400, "Mossa non valida.");
        }

        // Esegui la mossa
        draughts.move(moveToMake);

        // Aggiorna la tavola nella partita con la nuova configurazione
        partita.tavola = JSON.stringify({ initialBoard: draughts.board });
        await partita.save();

        // Deduzione dei crediti
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

        // Deduzione del costo della mossa
        giocatore.token_residuo -= 0.0125;
        await giocatore.save();
    }
}

export default MoveService;