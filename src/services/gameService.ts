import sequelize from '../database/database';
import initPartita from '../models/Partita';
import initGiocatore from '../models/Giocatore';
import ErrorFactory from "../factories/errorFactory";
import {
    EnglishDraughts as Draughts
} from 'rapid-draughts/english';
import { Op } from "sequelize";
import { StatusCodes } from 'http-status-codes';
import { format } from "date-fns";

const Giocatore = initGiocatore(sequelize);
const Partita = initPartita(sequelize);

/**
 * @interface creaPartitaPvP
 * @description Interfaccia per il risultato di creazione di una partita tra due giocatori (PvP).
 * @property {boolean} success - Indica se la creazione della partita è avvenuta con successo.
 * @property {number} statusCode - Codice di stato HTTP.
 * @property {string} message - Messaggio descrittivo.
 * @property {Object} data - Dettagli della partita creata.
 * @property {number} data.id_partita - ID della partita creata.
 * @property {number} data.id_giocatore1 - ID del giocatore 1.
 * @property {number|null} data.id_giocatore2 - ID del giocatore 2 (null se la partita è contro l'IA).
 * @property {string} data.stato - Stato della partita.
 * @property {string} data.tavola - Stato iniziale della tavola di gioco.
 * @property {string} data.data_inizio - Data di inizio della partita.
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
 * @interface creaPartitaPvAI
 * @description Interfaccia per il risultato di creazione di una partita contro l'intelligenza artificiale (PvAI).
 * @property {boolean} success - Indica se la creazione della partita è avvenuta con successo.
 * @property {number} statusCode - Codice di stato HTTP.
 * @property {string} message - Messaggio descrittivo.
 * @property {Object} data - Dettagli della partita creata.
 * @property {number} data.id_partita - ID della partita creata.
 * @property {string} data.stato - Stato della partita.
 * @property {number} data.id_giocatore1 - ID del giocatore 1.
 * @property {string} data.data_inizio - Data di inizio della partita.
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
 * @function formatDate
 * @description Funzione per formattare una data nel formato YYYY-MM-DD.
 *
 * @param {Date} date - La data da formattare.
 * @returns {string} - Ritorna la data formattata nel formato YYYY-MM-DD.
 */
const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
};

/**
 * @function getIdGiocatore
 * @description Funzione che trova l'ID di un giocatore basandosi sull'email fornita.
 *
 * @param {string} email - L'email del giocatore.
 * @returns {Promise<number|null>} - Restituisce l'ID del giocatore o null se non viene trovato.
 */
const getIdGiocatore = async (email: string): Promise<number | null> => {
    const giocatore = await Giocatore.findOne({ where: { email } });
    return giocatore ? giocatore.id_giocatore : null;
};

/**
 * @function createGame
 * @description Funzione per creare una nuova partita di dama.
 * La partita può essere tra due giocatori o contro l'intelligenza artificiale.
 *
 * @param {number} id_giocatore1 - L'ID del giocatore 1 (creatore della partita).
 * @param {string|null} email_giocatore2 - L'email del giocatore 2 (se la partita è PvP).
 * Se la partita è contro l'IA, questo parametro è null.
 * @param {"Amichevole" | "Normale" | "Competitiva"} tipo - Il tipo di partita (Amichevole, Normale o Competitiva).
 * @param {"facile" | "normale" | "difficile" | "estrema" | null} livello_IA - Il livello dell'intelligenza artificiale
 * (se applicabile).
 *
 * @returns {Promise<creaPartitaPvP | creaPartitaPvAI>} - Ritorna i dettagli della partita creata.
 *
 * @throws {HttpException} - Restituisce un errore se il giocatore non ha abbastanza crediti, se ha già una partita in corso,
 * o se si verificano altri errori.
 */
export const createGame = async (
    id_giocatore1: number,
    email_giocatore2: string | null,
    tipo: "Amichevole" | "Normale" | "Competitiva",
    livello_IA: "facile" | "normale" | "difficile" | "estrema" | null
): Promise<creaPartitaPvP | creaPartitaPvAI> => {
    const costoCreazione = 0.45;

    try {
        const giocatore1 = await Giocatore.findByPk(id_giocatore1);
        if (!giocatore1) {
            throw ErrorFactory.createError('FORBIDDEN', 'Il giocatore non esiste!');
        }

        if (giocatore1.token_residuo <= 0) {
            throw ErrorFactory.createError('UNAUTHORIZED', 'Token terminati. Non puoi effettuare questa operazione.');
        }

        const partitaInCorsoGiocatore1 = await Partita.findOne({
            where: {
                [Op.or]: [
                    { id_giocatore1: id_giocatore1 },
                    { id_giocatore2: id_giocatore1 }
                ],
                stato: 'in corso'
            }
        });

        if (partitaInCorsoGiocatore1) {
            throw ErrorFactory.createError('BAD_REQUEST', 'Hai già una partita in corso.');
        }

        let id_giocatore2: number | null = null;

        if (email_giocatore2) {
            id_giocatore2 = await getIdGiocatore(email_giocatore2);
            if (!id_giocatore2) {
                throw ErrorFactory.createError('NOT_FOUND', `Il giocatore con email ${email_giocatore2} non è stato trovato.`);
            }

            const partitaInCorsoGiocatore2 = await Partita.findOne({
                where: {
                    [Op.or]: [
                        { id_giocatore1: id_giocatore2 },
                        { id_giocatore2: id_giocatore2 }
                    ],
                    stato: 'in corso'
                }
            });

            if (partitaInCorsoGiocatore2) {
                throw ErrorFactory.createError('BAD_REQUEST', `Il giocatore con email ${email_giocatore2} ha già una partita in corso. Deve completarla o abbandonarla prima di poter giocare una nuova partita.`);
            }
        }

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

        const partita = await Partita.create({
            id_giocatore1,
            id_giocatore2,
            stato: 'in corso',
            tipo,
            livello_IA,
            tavola,
            data_inizio: new Date(),
        });

        await removeCredits(id_giocatore1, costoCreazione);

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

        return {
            success: true,
            statusCode: StatusCodes.CREATED,
            message: "Partita PvP creata con successo",
            data: {
                id_partita: partita.id_partita,
                id_giocatore1: partita.id_giocatore1,
                id_giocatore2: partita.id_giocatore2,
                stato: partita.stato,
                tavola,
                data_inizio: formatDate(partita.data_inizio),
            }
        };
    } catch (error) {
        console.error('Errore durante la creazione della partita:', error);
        throw error;
    }
};

/**
 * @function verifyCredit
 * @description Verifica i crediti rimanenti di un giocatore.
 *
 * @param {number} id_giocatore1 - L'ID del giocatore di cui verificare i crediti.
 * @returns {Promise<number>} - Restituisce il numero di crediti rimanenti.
 *
 * @throws {HttpException} - Restituisce un errore se il giocatore non viene trovato.
 */
const verifyCredit = async (id_giocatore1: number): Promise<number> => {
    const giocatore = await Giocatore.findByPk(id_giocatore1);
    if (!giocatore) {
        throw ErrorFactory.createError('NOT_FOUND', 'Giocatore non trovato.');
    }
    return giocatore.token_residuo;
};

/**
 * @function removeCredits
 * @description Addebita un importo di crediti al giocatore specificato.
 *
 * @param {number} id_giocatore1 - L'ID del giocatore.
 * @param {number} importo - L'importo di crediti da addebitare.
 * @returns {Promise<void>} - Restituisce una `Promise` vuota al termine dell'operazione.
 *
 * @throws {HttpException} - Restituisce un errore se il giocatore non viene trovato.
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
