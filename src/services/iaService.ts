// Importa le librerie necessarie da 'rapid-draughts' e 'rapid-draughts/english'
const { Draughts, DraughtsPlayer, DraughtsStatus } = require('rapid-draughts');
const { EnglishDraughtsComputerFactory: ComputerFactory } = require('rapid-draughts/english');

// Definisci l'interfaccia Partita per tipizzare gli oggetti partita
interface Partita {
    giocatoreAttuale: string;  // Nome o identificatore del giocatore attuale
    stato: string;  // Stato della partita
    id_partita: number;     // ID della partita
}

// Definisci i possibili livelli di IA
export type LivelloIA = 'facile' | 'normale' | 'difficile' | 'estrema';

// Funzione per generare una mossa IA
export const generaMossaIA = async (partita: Partita, livelloIA: LivelloIA) => {
    let iaPlayer: (draughts: any) => Promise<any>;  // Funzione per generare la mossa IA

    // Scegli la strategia basata sul livello di difficoltà
    switch (livelloIA) {
        case 'facile':
            iaPlayer = ComputerFactory.random();  // Strategia casuale
            break;
        case 'normale':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 3 });  // Profondità bassa per IA "normale"
            break;
        case 'difficile':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 5 });  // Profondità media per IA "difficile"
            break;
        case 'estrema':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 7 });  // Profondità alta per IA "estrema"
            break;
        default:
            throw new Error("Livello IA non valido");  // Errore se il livello IA non è valido
    }

    // Inizializza il gioco in base allo stato della partita
    const draughts = Draughts.setup();  // Crea una nuova partita di draughts (dama)

    // Se la partita è in corso, continua a fare mosse IA finché non c'è un vincitore
    while (draughts.status === DraughtsStatus.PLAYING) {
        const mossaIA = await iaPlayer(draughts);  // Genera la mossa IA
        draughts.move(mossaIA);  // Applica la mossa IA

        // Dopo la mossa IA, salva lo stato della partita (esempio di codice per salvare lo stato)
        // Nota: Dovrai adattare questo codice a come gestisci la persistenza nel tuo database
        console.log(`Mossa IA eseguita: ${mossaIA}`);
    }

    // Ritorna la mossa IA e lo stato aggiornato del gioco
    return { draughts, mossaIA: draughts.history.moves[draughts.history.moves.length - 1] };
};

// Funzione per inizializzare e gestire una nuova partita contro IA
export const startGameIA = async (giocatore1: number, livelloIA: LivelloIA) => {
    const draughts = Draughts.setup();  // Inizializza una nuova partita

    let iaPlayer: (draughts: any) => Promise<any>;  // Funzione per generare la mossa IA

    // Scegli la strategia basata sul livello di difficoltà
    switch (livelloIA) {
        case 'facile':
            iaPlayer = ComputerFactory.random();  // Strategia casuale
            break;
        case 'normale':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 3 });  // Profondità bassa
            break;
        case 'difficile':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 5 });  // Profondità media
            break;
        case 'estrema':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 7 });  // Profondità alta
            break;
        default:
            throw new Error("Livello IA non valido");
    }

    // Loop per far giocare la partita fino a che non si trova un vincitore
    while (draughts.status === DraughtsStatus.PLAYING) {
        // Genera la mossa dell'IA e la applica
        const mossaIA = await iaPlayer(draughts);
        draughts.move(mossaIA);

        // Puoi salvare qui lo stato della partita e delle mosse nel database
        console.log(`Mossa IA: ${mossaIA}`);
    }

    // Ritorna lo stato finale del gioco e le mosse eseguite
    return {
        status: draughts.status,
        moves: draughts.history.moves.length,
        board: draughts.asciiBoard(),
    };
};