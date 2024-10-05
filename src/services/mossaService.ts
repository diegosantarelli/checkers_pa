import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import HttpException from "../helpers/errorHandler";
import boardConfig from '../boardConfiguration.json';
import { DraughtsPlayer, DraughtsStatus } from 'rapid-draughts';
import { EnglishDraughts as Draughts } from 'rapid-draughts/english';

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);

class MoveService {
    public static async executeMove(id_partita: number, from: string, to: string, id_giocatore1: number) {
        const partita = await Partita.findByPk(id_partita);
        if (!partita) {
            throw new HttpException(404, "Partita non trovata.");
        }

        // Log della tavola prima di analizzarla
        console.log("Tavola prima di JSON.parse:", partita.tavola);

        // Parse della tavola
        const board = JSON.parse(partita.tavola);

        // Inizializza il gioco
        const draughts = Draughts.setup();

        // Imposta i pezzi sulla scacchiera
        board.forEach((row: string[], rowIndex: number) => {
            row.forEach((cell: string, colIndex: number) => {
                if (cell !== ' ') {
                    const piece = cell === 'b' ? DraughtsPlayer.DARK : DraughtsPlayer.LIGHT;
                    draughts.board[rowIndex * 8 + colIndex] = {
                        position: rowIndex * 8 + colIndex,
                        dark: true,
                        piece: {
                            king: false,
                            player: piece,
                        },
                    };
                }
            });
        });

        // Controlla se la mossa è valida
        const validMoves = draughts.moves;
        const origin = parseInt(from); // Assicurati che `from` sia un numero
        const destination = parseInt(to); // Assicurati che `to` sia un numero

        // Creazione dell'oggetto mossa
        const moveToMake = {
            origin,
            destination,
            captures: [] // Assicurati di impostare eventuali catture se necessarie
        };

        if (!validMoves.some(move => move.origin === origin && move.destination === destination)) {
            throw new HttpException(400, "Mossa non valida.");
        }

        // Esegui la mossa
        draughts.move(moveToMake);

        // Aggiorna la tavola nella partita
        partita.tavola = JSON.stringify(draughts.board); // Aggiorna la tavola con la nuova configurazione
        await partita.save();

        // Deduzione dei crediti
        await MoveService.deductMoveCost(id_giocatore1);

        return {
            message: "Mossa eseguita con successo",
            id_partita: partita.id_partita,
            tavola: JSON.parse(partita.tavola) // Restituisce la tavola in formato JSON
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