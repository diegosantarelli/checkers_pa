import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import ErrorFactory from "../factories/errorFactory";
import {
    EnglishDraughts as Draughts
} from 'rapid-draughts/english';
import { Op } from "sequelize";
import { StatusCodes } from 'http-status-codes';
import { format } from "date-fns"; // Importa date-fns per la formattazione della data

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);

/**
 * Interfaccia per il risultato di creazione di una partita PvP.
 */
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
        data_inizio: string;
    };
}

/**
 * Interfaccia per il risultato di creazione di una partita PvAI.
 */
interface creaPartitaPvAI {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        id_partita: number;
        stato: string;
        id_giocatore1: number;
        data_inizio: string;
    };
}

/**
 * Funzione per formattare una data nel formato YYYY-MM-DD.
 */
const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
};

/**
 * Trova l'ID del giocatore in base all'email.
 */
const getIdGiocatore = async (email: string): Promise<number | null> => {
    const giocatore = await Giocatore.findOne({ where: { email } });
    return giocatore ? giocatore.id_giocatore : null;
};

/**
 * Crea una partita PvP o contro IA.
 */
export const createGame = async (
    id_giocatore1: number,
    email_giocatore2: string | null,
    tipo: "Amichevole" | "Normale" | "Competitiva",
    livello_IA: "facile" | "normale" | "difficile" | "estrema" | null
): Promise<creaPartitaPvP | creaPartitaPvAI> => {
    const costoCreazione = 0.45;

    try {
        // Verifica che il giocatore esista e abbia il ruolo corretto
        const giocatore1 = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore1) {
            throw ErrorFactory.createError('FORBIDDEN', 'Il giocatore non esiste!');
        }

        // Verifica che il giocatore abbia abbastanza crediti
        if (giocatore1.token_residuo <= 0) {
            throw ErrorFactory.createError('UNAUTHORIZED', 'Token terminati. Non puoi effettuare questa operazione.');
        }

        // Verifica se il giocatore ha già una partita in corso
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
            throw ErrorFactory.createError('BAD_REQUEST', 'Hai già una partita in corso. Devi completarla o abbandonarla prima di crearne una nuova.');
        }

        // Validazione del tipo e del livello IA
        const tipiValidi = ["Amichevole", "Normale", "Competitiva"];
        const livelliValidi = ["facile", "normale", "difficile", "estrema"];

        if (!tipiValidi.includes(tipo)) {
            throw ErrorFactory.createError('BAD_REQUEST', `Il tipo ${tipo} non è valido. I tipi validi sono: ${tipiValidi.join(", ")}`);
        }

        if (livello_IA && !livelliValidi.includes(livello_IA)) {
            throw ErrorFactory.createError('BAD_REQUEST', `Il livello IA ${livello_IA} non è valido. I livelli validi sono: ${livelliValidi.join(", ")}`);
        }

        // Verifica che l'utente non possa sfidare sé stesso
        if (email_giocatore2 && email_giocatore2 === giocatore1.email) {
            throw ErrorFactory.createError('BAD_REQUEST', "Non puoi sfidare te stesso.");
        }

        // Verifica credito
        const creditoGiocatore1 = await verifyCredit(id_giocatore1);
        if (creditoGiocatore1 < costoCreazione) {
            throw ErrorFactory.createError('UNAUTHORIZED', 'Token terminati. Non puoi effettuare questa operazione.');
        }

        // Trova l'ID del secondo giocatore, se specificato
        let id_giocatore2: number | null = null;
        if (email_giocatore2) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email_giocatore2)) {
                throw ErrorFactory.createError('BAD_REQUEST', `Email ${email_giocatore2} non è valida. Usa un formato email valido.`);
            }

            id_giocatore2 = await getIdGiocatore(email_giocatore2);
            if (!id_giocatore2) {
                throw ErrorFactory.createError('NOT_FOUND', `Il giocatore con email ${email_giocatore2} non è stato trovato.`);
            }
        }

        // Impostazione iniziale della tavola di gioco
        const draughts = Draughts.setup();
        const initialBoard = draughts.board.map((square: any, index: number) => {
            if (square && square.dark) {
                return {
                    dark: true,
                    position: index,
                    piece: square.piece
                };
            }
            return null;
        }).filter(Boolean);

        const tavola = JSON.stringify({ initialBoard });

        // Creazione della partita
        const partita = await Partita.create({
            id_giocatore1,
            id_giocatore2,
            stato: 'in corso',
            tipo,
            livello_IA,
            tavola,
            data_inizio: new Date(),
        });

        // Addebita crediti al giocatore
        await removeCredits(id_giocatore1, costoCreazione);

        // Risposta per partita contro IA
        if (livello_IA) {
            return {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Partita contro IA creata con successo",
                data: {
                    id_partita: partita.id_partita,
                    stato: partita.stato,
                    id_giocatore1: id_giocatore1,
                    data_inizio: formatDate(partita.data_inizio),
                }
            };
        }

        // Risposta per partita PvP
        return {
            success: true,
            statusCode: StatusCodes.CREATED,
            message: "Partita PvP creata con successo",
            data: {
                id_partita: partita.id_partita,
                id_giocatore1: partita.id_giocatore1,
                id_giocatore2: partita.id_giocatore2,
                stato: partita.stato,
                data_inizio: formatDate(partita.data_inizio),
            }
        };
    } catch (error) {
        console.error('Errore durante la creazione della partita:', error);
        throw error;
    }
};

/**
 * Verifica i crediti rimanenti del giocatore.
 */
const verifyCredit = async (id_giocatore1: number): Promise<number> => {
    const giocatore = await Giocatore.findByPk(id_giocatore1);
    if (!giocatore) {
        throw ErrorFactory.createError('NOT_FOUND', 'Giocatore non trovato.');
    }
    return giocatore.token_residuo;
};

/**
 * Addebita i crediti al giocatore.
 */
const removeCredits = async (id_giocatore1: number, importo: number): Promise<void> => {
    const giocatore = await Giocatore.findByPk(id_giocatore1);
    if (!giocatore) {
        throw ErrorFactory.createError('NOT_FOUND', 'Giocatore non trovato.');
    }
    giocatore.token_residuo -= importo;
    await giocatore.save();
};

export default {
    createGame,
};
