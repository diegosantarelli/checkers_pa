import sequelize from '../database/database'; // La tua configurazione di Sequelize
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
const { Draughts } = require('rapid-draughts'); // Importazione della libreria Draughts

// Questo file contiene la logica generale per gestire le partite tra due giocatori umani.

// Inizializza i modelli con sequelize
const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize); // Inizializza il modello con l'istanza di sequelize

// Funzione per creare una nuova partita
export const creaPartita = async (
    idGiocatore1: number,
    idGiocatore2: number | null,
    tipo: string // Aggiungi il campo `tipo` come parametro
) => {
    const costoCreazione = 0.45;

    // Verifica il credito del giocatore 1
    const creditoGiocatore1 = await verificaCredito(idGiocatore1);
    if (creditoGiocatore1 < costoCreazione) {
        throw new Error('Credito insufficiente per creare la partita.');
    }

    // Crea la nuova partita
    const partita = await Partita.create({
        id_giocatore1: idGiocatore1,
        id_giocatore2: idGiocatore2,
        stato: 'in corso',
        tipo: tipo, // Aggiungi il tipo alla creazione della partita
        data_inizio: new Date(),
    });

    // Aggiungi la proprietà `giocatoreAttuale` temporaneamente
    const partitaConGiocatoreAttuale = {
        ...partita.get(), // Ottiene le proprietà di partita
        giocatoreAttuale: 'giocatore1', // Imposta manualmente la proprietà giocatoreAttuale
    };

    // Addebita i token al giocatore 1
    await addebitaCrediti(idGiocatore1, costoCreazione);

    // Inizializza il gioco Draughts per la partita
    const draughts = Draughts.setup({
        player: Draughts.Player[partitaConGiocatoreAttuale.giocatoreAttuale], // Imposta il giocatore attuale
    });

    return { partita: partitaConGiocatoreAttuale, draughts }; // Restituisci la partita creata e lo stato del gioco
};

// Funzione per recuperare una partita esistente
export const recuperaPartita = async (idPartita: number) => {
    const partita = await Partita.findByPk(idPartita, {
        include: [
            { model: Giocatore, as: 'giocatore1' },
            { model: Giocatore, as: 'giocatore2' },
        ],
    });

    if (!partita) {
        throw new Error('Partita non trovata.');
    }

    // Aggiungi la proprietà `giocatoreAttuale` temporaneamente
    const partitaConGiocatoreAttuale = {
        ...partita.get(),
        giocatoreAttuale: 'giocatore1', // Questa logica può essere dinamica a seconda dello stato del gioco
    };

    return partitaConGiocatoreAttuale; // Restituisci la partita recuperata con la proprietà giocatoreAttuale
};

// Funzione per aggiornare lo stato della partita
// Funzione per aggiornare lo stato della partita
export const aggiornaStatoPartita = async (idPartita: number, nuovoStato: string) => {
    const partita = await Partita.findByPk(idPartita); // Recupera l'istanza della partita dal database

    if (!partita) {
        throw new Error('Partita non trovata.');
    }

    // Convalida il nuovo stato
    if (['in corso', 'completata', 'abbandonata'].includes(nuovoStato)) {
        partita.stato = nuovoStato as 'in corso' | 'completata' | 'abbandonata'; // Type assertion per confermare che `nuovoStato` è del tipo corretto
        await partita.save(); // Usa l'istanza Sequelize per salvare lo stato aggiornato
    } else {
        throw new Error('Stato non valido'); // Se il valore non è valido, lancia un errore
    }

    // Aggiungi `giocatoreAttuale` solo al momento di restituire la risposta
    const partitaConGiocatoreAttuale = {
        ...partita.get(), // Ottieni i dati della partita
        giocatoreAttuale: 'giocatore1', // Logica per determinare il giocatore attuale
    };

    return partitaConGiocatoreAttuale; // Restituisci la partita aggiornata con `giocatoreAttuale`
};

// Funzione di verifica del credito
const verificaCredito = async (idGiocatore: number): Promise<number> => {
    // Recupera il giocatore dal database
    const giocatore = await Giocatore.findByPk(idGiocatore);
    if (!giocatore) {
        throw new Error('Giocatore non trovato.');
    }
    return giocatore.token_residuo; // Restituisci il saldo dei token
};

// Funzione per addebitare i crediti
const addebitaCrediti = async (idGiocatore: number, importo: number): Promise<void> => {
    const giocatore = await Giocatore.findByPk(idGiocatore);
    if (!giocatore) {
        throw new Error('Giocatore non trovato.');
    }
    giocatore.token_residuo -= importo; // Deduci l'importo dal saldo dei token
    await giocatore.save(); // Salva le modifiche
};