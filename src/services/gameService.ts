import sequelize from '../database/database'; // La tua configurazione di Sequelize
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import { generaMossaIA } from './iaService'; // Importa il servizio IA
import { LivelloIA } from './iaService';// Assicurati di importare il tipo LivelloIA

// Inizializza i modelli con sequelize
const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize); // Inizializza il modello con l'istanza di sequelize

// Funzione per creare una nuova partita
export const creaPartita = async (idGiocatore1: number, idGiocatore2: number | null, livelloIA: string | null) => {
    const costoCreazione = 0.45;

    // Verifica il credito del giocatore 1
    const creditoGiocatore1 = await verificaCredito(idGiocatore1);
    if (creditoGiocatore1 < costoCreazione) {
        throw new Error("Credito insufficiente per creare la partita.");
    }

    // Crea la nuova partita
    const partita = await Partita.create({
        id_giocatore1: idGiocatore1,
        id_giocatore2: idGiocatore2,
        stato: 'in corso',
    });

    // Aggiungi la proprietà `giocatoreAttuale`
    const partitaConGiocatoreAttuale = {
        ...partita.get(),
        giocatoreAttuale: 'giocatore1',
    };

    // Addebita i token al giocatore 1
    await addebitaCrediti(idGiocatore1, costoCreazione);

    // Verifica se `livelloIA` è valido
    if (livelloIA && ['facile', 'normale', 'difficile', 'estrema'].includes(livelloIA)) {
        const livelloIAValidato = livelloIA as LivelloIA;  // Cast a LivelloIA dopo la convalida
        const { draughts, mossaIA } = await generaMossaIA(partitaConGiocatoreAttuale, livelloIAValidato);
        return { partita: partitaConGiocatoreAttuale, draughts, mossaIA };
    }

    return { partita: partitaConGiocatoreAttuale }; // Restituisci la partita creata
};

// Funzione per recuperare una partita esistente
export const recuperaPartita = async (idPartita: number) => {
    const partita = await Partita.findByPk(idPartita, {
        include: [{ model: Giocatore, as: 'giocatore1' }, { model: Giocatore, as: 'giocatore2' }],
    });

    if (!partita) {
        throw new Error("Partita non trovata.");
    }

    return partita; // Restituisci la partita recuperata
};

// Funzione per aggiornare lo stato della partita
export const aggiornaStatoPartita = async (idPartita: number, nuovoStato: string) => {
    const partita = await recuperaPartita(idPartita);

    // Convalida il nuovo stato
    if (nuovoStato === 'in corso' || nuovoStato === 'completata' || nuovoStato === 'abbandonata') {
        partita.stato = nuovoStato; // Assegna lo stato valido
        await partita.save();
    } else {
        throw new Error('Stato non valido'); // Se il valore non è valido, lancia un errore
    }

    return partita; // Restituisci la partita aggiornata
};

// Funzione di verifica del credito
const verificaCredito = async (idGiocatore: number): Promise<number> => {
    // Recupera il giocatore dal database
    const giocatore = await Giocatore.findByPk(idGiocatore);
    if (!giocatore) {
        throw new Error("Giocatore non trovato.");
    }
    return giocatore.token_residuo; // Restituisci il saldo dei token
};

// Funzione per addebitare i crediti
const addebitaCrediti = async (idGiocatore: number, importo: number): Promise<void> => {
    const giocatore = await Giocatore.findByPk(idGiocatore);
    if (!giocatore) {
        throw new Error("Giocatore non trovato.");
    }
    giocatore.token_residuo -= importo; // Deduci l'importo dal saldo dei token
    await giocatore.save(); // Salva le modifiche
};