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
interface creaPartitaPvP {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        id_partita: number;
        id_giocatore1: number;
        id_giocatore2: number | null;
        stato: string;
        data_inizio: Date;
    };
}

interface creaPartitaPvAI {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        id_partita: number;
        stato: string;
        id_giocatore1: number; // Aggiungi ID del giocatore
        data_inizio: Date;
    };
}

// Funzione per trovare l'ID del giocatore in base all'email
const trovaIdGiocatore = async (email: string): Promise<number | null> => {
    const giocatore: any = await Giocatore.findOne({ where: { email } });
    return giocatore ? giocatore.id_giocatore : null; // Restituisce l'ID o null se non trovato
};

// Funzione per creare una nuova partita
export const creaPartita = async (
    id_giocatore1: number,
    email_giocatore2: string | null,
    tipo: string,
    livello_IA?: string // Aggiungi un livello di IA opzionale
): Promise<creaPartitaPvP | creaPartitaPvAI> => {
    const costoCreazione = 0.45;

    // Verifica il credito del giocatore 1
    const creditoGiocatore1 = await verificaCredito(id_giocatore1);
    if (creditoGiocatore1 < costoCreazione) {
        throw new Error('Credito insufficiente per creare la partita.');
    }

    // Trova id_giocatore2 usando l'email
    const id_giocatore2 = email_giocatore2 ? await trovaIdGiocatore(email_giocatore2) : null;

    // Crea la nuova partita
    const partita = await Partita.create({
        id_giocatore1: id_giocatore1,
        id_giocatore2: id_giocatore2,
        stato: 'in corso',
        tipo: tipo,
        livello_IA: livello_IA || null, // Imposta livello_IA a null se non fornito
        data_inizio: new Date(),
    });

    // Addebita i token al giocatore 1
    await addebitaCrediti(id_giocatore1, costoCreazione);

    // Inizializza il gioco Draughts per la partita
    const draughts = Draughts.setup();

    // Se è una partita contro IA
    if (livello_IA) {
        return {
            success: true,
            statusCode: 200,
            message: "Partita contro IA creata con successo",
            data: {
                id_partita: partita.id_partita,
                stato: draughts.status,
                id_giocatore1: id_giocatore1,
                data_inizio: partita.data_inizio,
            }
        };
    }

    // Restituisci la partita creata e lo stato del gioco per PvP
    return {
        success: true,
        statusCode: 201,
        message: "Partita PvP creata con successo",
        data: {
            id_partita: partita.id_partita,
            id_giocatore1: partita.id_giocatore1,
            id_giocatore2: partita.id_giocatore2,
            stato: partita.stato,
            data_inizio: partita.data_inizio,
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
};