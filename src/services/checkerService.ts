/*import { DraughtsPlayer, DraughtsStatus } from 'rapid-draughts';

import {
    EnglishDraughts as Draughts,
    EnglishDraughtsComputerFactory as ComputerFactory,
} from 'rapid-draughts/english';
import Giocatore from "../models/Giocatore";
import Partita from "../models/Partita";
import Mossa from "../models/Mossa";

class checkerService {
    private draughts: any;
    private weakComputer: any;
    private strongComputer: any;

    constructor() {
        // Inizializza il gioco
        this.draughts = Draughts.setup();

        // Inizializza i livelli di IA
        this.weakComputer = ComputerFactory.random();
        this.strongComputer = ComputerFactory.alphaBeta({ maxDepth: 7 });
    }

    async startGame(player1: Giocatore, player2: Giocatore | null, partita: Partita) {
        try {
            // Assegna i giocatori alla partita e registra la prima mossa
            // Se player2 è `null`, allora è una partita contro l'IA

            if (!player2) {
                // Gioca contro l'IA finché non c'è un vincitore
                while (this.draughts.status === DraughtsStatus.PLAYING) {
                    const currentPlayer = this.draughts.player === DraughtsPlayer.LIGHT
                        ? this.weakComputer
                        : this.strongComputer;

                    const move = await currentPlayer(this.draughts);
                    if (move) this.draughts.move(move);

                    // Registra la mossa nel database
                    await Mossa.create({
                        id_partita: partita.id,
                        id_giocatore: player1.id,  // Sempre l'utente umano in questo caso
                        numero_mossa: this.draughts.history.moves.length,
                        tavola: this.draughts.board,  // Stato attuale del gioco
                    });
                }
            }

            return {
                status: this.draughts.status,
                moves: this.draughts.history.moves.length,
                board: this.draughts.asciiBoard(),
            };
        } catch (error) {
            throw new Error('Errore durante la partita contro l\'IA');
        }
    }
}

export default checkerService;

*/
