import sequelize from '../database/database'; // La tua configurazione di Sequelize
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import { DraughtsPlayer, DraughtsStatus } from 'rapid-draughts';
import {
    EnglishDraughts as Draughts,
    EnglishDraughtsComputerFactory as ComputerFactory,
} from 'rapid-draughts/english';

// Inizializza i modelli con sequelize
const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize); // Inizializza il modello con l'istanza di sequelize

// Definisci un'interfaccia per il risultato della creazione della partita
interface RisultatoPartitaPvP {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        id_partita: number;
        id_giocatore1: number;
        id_giocatore2: number | null;
        difficolta: null;
        stato: string;
        data_inizio: Date;
    };
}

interface RisultatoPartitaPvAI {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        stato: string;
        mosse: number;
        tavola: string;
    };
}

// Funzione per creare una nuova partita
export const creaPartita = async (
    id_giocatore1: number,
    id_giocatore2: number | null,
    tipo: string,
    difficolta?: string // Aggiungi un livello di IA opzionale
): Promise<RisultatoPartitaPvP | RisultatoPartitaPvAI> => {
    const costoCreazione = 0.45;

    // Verifica il credito del giocatore 1
    const creditoGiocatore1 = await verificaCredito(id_giocatore1);
    if (creditoGiocatore1 < costoCreazione) {
        throw new Error('Credito insufficiente per creare la partita.');
    }

    // Crea la nuova partita
    const partita = await Partita.create({
        id_giocatore1: id_giocatore1,
        id_giocatore2: id_giocatore2,
        stato: 'in corso',
        tipo: tipo, // Aggiungi il tipo alla creazione della partita
        data_inizio: new Date(),
    });

    // Addebita i token al giocatore 1
    await addebitaCrediti(id_giocatore1, costoCreazione);

    // Inizializza il gioco Draughts per la partita
    const draughts = Draughts.setup(); // Usa solo Draughts.setup() senza specificare il giocatore

    // Se è una partita contro IA, gestisci la logica dell'IA
    if (difficolta) {
        return await gestisciPartitaIA(draughts, difficolta); // Inizia la partita contro l'IA
    }

    // Restituisci la partita creata e lo stato del gioco per PvP
    return {
        success: true,
        statusCode: 201,
        message: "Partita creata con successo",
        data: {
            id_partita: partita.id_partita, // Assicurati che il campo id sia corretto
            id_giocatore1: partita.id_giocatore1,
            id_giocatore2: partita.id_giocatore2,
            difficolta: null,
            stato: partita.stato,
            data_inizio: partita.data_inizio,
        }
    };
};

// Funzione per gestire una partita contro IA
const gestisciPartitaIA = async (draughts: any, difficolta: string) => {
    let iaPlayer: (draughts: any) => Promise<any>; // Funzione per generare la mossa IA

    // Scegli la strategia basata sul livello di difficoltà
    switch (difficolta) {
        case 'facile':
            iaPlayer = ComputerFactory.random(); // Strategia casuale
            break;
        case 'normale':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 3 }); // Profondità bassa
            break;
        case 'difficile':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 5 }); // Profondità media
            break;
        case 'estrema':
            iaPlayer = ComputerFactory.alphaBeta({ maxDepth: 7 }); // Profondità alta
            break;
        default:
            throw new Error("Livello IA non valido");
    }

    // Loop per far giocare la partita fino a che non si trova un vincitore
    while (draughts.status === DraughtsStatus.PLAYING) {
        const mossaIA = await iaPlayer(draughts); // Genera la mossa IA
        draughts.move(mossaIA); // Applica la mossa IA
        console.log(`Mossa IA eseguita: ${mossaIA}`);
    }

    // Ritorna lo stato finale della partita
    return {
        success: true,
        statusCode: 200,
        message: "Partita terminata",
        data: {
            stato: draughts.status, // Modificato per allinearsi con l'interfaccia
            mosse: draughts.history.moves.length, // Modificato per allinearsi con l'interfaccia
            tavola: draughts.asciiBoard(), // Modificato per allinearsi con l'interfaccia
        }
    };
};

// Funzione di verifica del credito
const verificaCredito = async (id_giocatore1: number): Promise<number> => {
    const giocatore = await Giocatore.findByPk(id_giocatore1);
    if (!giocatore) {
        throw new Error('Giocatore non trovato.');
    }
    return giocatore.token_residuo; // Restituisci il saldo dei token
};

// Funzione per addebitare i crediti
const addebitaCrediti = async (id_giocatore1: number, importo: number): Promise<void> => {
    const giocatore = await Giocatore.findByPk(id_giocatore1);
    if (!giocatore) {
        throw new Error('Giocatore non trovato.');
    }
    giocatore.token_residuo -= importo; // Deduci l'importo dal saldo dei token
    await giocatore.save(); // Salva le modifiche
};

export default {
    creaPartita,
    // Altre esportazioni se necessario
};