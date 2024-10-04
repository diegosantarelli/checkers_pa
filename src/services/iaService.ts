const { Draughts, DraughtsPlayer } = require('rapid-draughts');
const { EnglishDraughtsComputerFactory: ComputerFactory } = require('rapid-draughts/english');

interface Partita {
    giocatoreAttuale: string; // Nome o identificatore del giocatore attuale
}

export type LivelloIA = 'facile' | 'normale' | 'difficile' | 'estrema'; // Tipi per i livelli di difficoltà

export const generaMossaIA = async (partita: Partita, livelloIA: LivelloIA) => {
    let iaPlayer: (draughts: any) => Promise<any>; // Tipizza iaPlayer come una funzione che accetta un oggetto 'draughts'

    // Scegli la strategia basata sul livelloIA
    switch (livelloIA) {
        case 'facile':
            iaPlayer = ComputerFactory.random(); // Strategia casuale
            break;
        case 'normale':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 3 }); // Profondità bassa per una difficoltà normale
            break;
        case 'difficile':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 5 }); // Profondità media per una difficoltà difficile
            break;
        case 'estrema':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 7 }); // Profondità alta per la difficoltà estrema
            break;
        default:
            throw new Error("Livello IA non valido");
    }

    // Crea il gioco in base alla partita corrente
    const draughts = Draughts.setup({
        player: DraughtsPlayer[partita.giocatoreAttuale]
    });

    // Genera e applica la mossa IA
    const mossaIA = await iaPlayer(draughts);
    draughts.move(mossaIA);

    // Ritorna la mossa IA e lo stato aggiornato
    return { draughts, mossaIA };
};