import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import HttpException from "../helpers/errorHandler";
import { DraughtsPlayer, DraughtsStatus } from 'rapid-draughts';
import {
    EnglishDraughts as Draughts,
    EnglishDraughtsComputerFactory as ComputerFactory,
} from 'rapid-draughts/english';
import {Op} from "sequelize";

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);

interface creaPartitaPvP {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        id_partita: number;
        id_giocatore1: number;
        id_giocatore2: number | null;
        stato: string;
        tavola: string;
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

export const creaPartita = async (
    id_giocatore1: number,
    email_giocatore2: string | null,
    tipo: "Amichevole" | "Normale" | "Competitiva",
    livello_IA: "facile" | "normale" | "difficile" | "estrema" | null
): Promise<creaPartitaPvP | creaPartitaPvAI> => {
    const costoCreazione = 0.45;

    try {
        const giocatore1 = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore1 || giocatore1.ruolo !== 'utente') {
            throw new HttpException(403, 'Solo gli utenti normali possono creare una partita.');
        }

        // **CONTROLLA SE I TOKEN SONO ESAURITI**
        if (giocatore1.token_residuo <= 0) {
            throw new HttpException(401, 'Token terminati. Non puoi effettuare questa operazione.');
        }

        // **AGGIUNGI IL CONTROLLO PER PARTITE IN CORSO**
        const partitaInCorso = await Partita.findOne({
            where: {
                [Op.or]: [
                    { id_giocatore1: id_giocatore1 },
                    { id_giocatore2: id_giocatore1 }
                ],
                stato: 'in corso'
            }
        });

        if (partitaInCorso) {
            throw new HttpException(400, 'Hai già una partita in corso. Devi completarla prima di crearne una nuova.');
        }

        const tipiValidi = ["Amichevole", "Normale", "Competitiva"];
        const livelliValidi = ["facile", "normale", "difficile", "estrema"];

        if (!tipiValidi.includes(tipo)) {
            throw new HttpException(400, `Il tipo ${tipo} non è valido. I tipi validi sono: ${tipiValidi.join(", ")}`);
        }

        if (livello_IA && !livelliValidi.includes(livello_IA)) {
            throw new HttpException(400, `Il livello IA ${livello_IA} non è valido. I livelli validi sono: ${livelliValidi.join(", ")}`);
        }

        if (email_giocatore2 && email_giocatore2 === giocatore1.email) {
            throw new HttpException(400, "Non puoi sfidare te stesso.");
        }

        const creditoGiocatore1 = await verificaCredito(id_giocatore1);
        if (creditoGiocatore1 < costoCreazione) {
            throw new HttpException(401, 'Token terminati. Non puoi effettuare questa operazione.'); // Restituisci 401 se il credito è insufficiente
        }

        let id_giocatore2: number | null = null;
        if (email_giocatore2) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email_giocatore2)) {
                throw new HttpException(400, `L'email ${email_giocatore2} non è valida. Usa un formato email valido.`);
            }

            id_giocatore2 = await trovaIdGiocatore(email_giocatore2);
            if (!id_giocatore2) {
                throw new HttpException(404, `Il giocatore con email ${email_giocatore2} non è stato trovato.`);
            }
        }

        const tavola = JSON.stringify(Draughts.setup());

        const partita = await Partita.create({
            id_giocatore1,
            id_giocatore2,
            stato: 'in corso',
            tipo,
            livello_IA,
            tavola,
            data_inizio: new Date(),
        });

        await addebitaCrediti(id_giocatore1, costoCreazione);

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
        throw error;
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