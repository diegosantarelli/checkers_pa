const { Draughts, DraughtsPlayer } = require('rapid-draughts');

interface Mossa {
    origin: number;       // Posizione di origine
    destination: number;  // Posizione di destinazione
}

interface Partita {
    giocatoreAttuale: string; // Nome o identificatore del giocatore attuale
}

// Definisci un'interfaccia per una mossa valida
interface MossaDisponibile {
    origin: number;
    destination: number;
}

export const applicaMossa = (partita: Partita, mossa: Mossa) => {
    const draughts = Draughts.setup({
        player: DraughtsPlayer[partita.giocatoreAttuale] // Giocatore corrente
    });

    // Validazione della mossa
    const mosseDisponibili: MossaDisponibile[] = draughts.moves; // Tipizza le mosse disponibili
    const mossaValida = mosseDisponibili.some((m: MossaDisponibile) => m.origin === mossa.origin && m.destination === mossa.destination);

    if (!mossaValida) {
        throw new Error("Mossa non valida");
    }

    // Applicazione della mossa
    draughts.move(mossa);

    // Aggiornamento dello stato della partita
    const statoPartita = draughts.status;
    return { draughts, statoPartita };
};