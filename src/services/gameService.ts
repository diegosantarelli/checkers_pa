import sequelize from '../database/database'; // La tua configurazione di Sequelize
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import HttpException from "../helpers/errorHandler"; // Importa l'eccezione personalizzata

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
        id_giocatore1: number;
        data_inizio: Date;
    };
}

// Funzione per trovare l'ID del giocatore in base all'email
const trovaIdGiocatore = async (email: string): Promise<number | null> => {
    const giocatore = await Giocatore.findOne({ where: { email } });
    return giocatore ? giocatore.id_giocatore : null;
};

// Funzione per creare una nuova partita
export const creaPartita = async (
    id_giocatore1: number,
    email_giocatore2: string | null,
    tipo: "Amichevole" | "Normale" | "Competitiva",
    livello_IA: "facile" | "normale" | "difficile" | "estrema" | null
): Promise<creaPartitaPvP | creaPartitaPvAI> => {
    const costoCreazione = 0.45;

    try {
        // Validazione dei parametri
        const tipiValidi = ["Amichevole", "Normale", "Competitiva"];
        const livelliValidi = ["facile", "normale", "difficile", "estrema"];

        if (!tipiValidi.includes(tipo)) {
            throw new HttpException(400, `Il tipo '${tipo}' non è valido. I tipi validi sono: ${tipiValidi.join(", ")}`);
        }

        if (livello_IA && !livelliValidi.includes(livello_IA)) {
            throw new HttpException(400, `Il livello IA '${livello_IA}' non è valido. I livelli validi sono: ${livelliValidi.join(", ")}`);
        }

        // Verifica il credito del giocatore 1
        const creditoGiocatore1 = await verificaCredito(id_giocatore1);
        if (creditoGiocatore1 < costoCreazione) {
            throw new HttpException(400, 'Credito insufficiente per creare la partita.');
        }

        // Validazione email giocatore2 per PvP
        let id_giocatore2: number | null = null;

        if (email_giocatore2) {
            // Controlla il formato email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email_giocatore2)) {
                throw new HttpException(400, `L'email '${email_giocatore2}' non è valida. Usa un formato email valido, come 'tuo_nome_utente@example.com'.`);
            }

            // Trova id_giocatore2 usando l'email
            id_giocatore2 = await trovaIdGiocatore(email_giocatore2);
            if (!id_giocatore2) {
                throw new HttpException(404, `Il giocatore con email '${email_giocatore2}' non è stato trovato.`);
            }

            // Controlla che il giocatore 2 sia effettivamente il giocatore registrato con quella email
            const giocatore2 = await Giocatore.findByPk(id_giocatore2);
            if (giocatore2 && giocatore2.email !== email_giocatore2) {
                throw new HttpException(400, `L'email fornita non corrisponde al giocatore registrato.`);
            }
        }

        // Crea la nuova partita
        const partita = await Partita.create({
            id_giocatore1,
            id_giocatore2,
            stato: 'in corso',
            tipo,
            livello_IA,
            data_inizio: new Date(),
        });

        // Addebita i token al giocatore 1
        await addebitaCrediti(id_giocatore1, costoCreazione);

        // Se è una partita contro IA
        if (livello_IA) {
            return {
                success: true,
                statusCode: 200,
                message: "Partita contro IA creata con successo",
                data: {
                    id_partita: partita.id_partita,
                    stato: partita.stato,
                    id_giocatore1: id_giocatore1,
                    data_inizio: partita.data_inizio,
                }
            };
        }

        // Restituisci la partita creata per PvP
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
    } catch (error) {
        console.error('Errore durante la creazione della partita:', error);
        throw error; // Rilancia l'errore per essere gestito dal middleware degli errori
    }
};

// Funzione di verifica del credito
const verificaCredito = async (id_giocatore1: number): Promise<number> => {
    const giocatore = await Giocatore.findByPk(id_giocatore1);
    if (!giocatore) {
        throw new HttpException(404, 'Giocatore non trovato.');
    }
    return giocatore.token_residuo;
};

// Funzione per addebitare i crediti
const addebitaCrediti = async (id_giocatore1: number, importo: number): Promise<void> => {
    const giocatore = await Giocatore.findByPk(id_giocatore1);
    if (!giocatore) {
        throw new HttpException(404, 'Giocatore non trovato.');
    }
    giocatore.token_residuo -= importo;
    await giocatore.save();
};

export default {
    creaPartita,
};
