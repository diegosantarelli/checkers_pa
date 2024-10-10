import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

/**
 * @interface GiocatoreAttributes
 * @description Interfaccia che definisce gli attributi del modello Giocatore. Questi includono_
 * - ID del giocatore
 * - nome
 * - cognome
 * - email
 * - hash della password
 * - token residuo
 * - punteggio totale
 * - ruolo
 *
 * @property {number} [id_giocatore] - L'ID del giocatore (opzionale, generato automaticamente).
 * @property {string} nome - Il nome del giocatore.
 * @property {string} cognome - Il cognome del giocatore.
 * @property {string} email - L'email del giocatore, che deve essere univoca.
 * @property {string} hash - La password crittografata del giocatore.
 * @property {number} token_residuo - Il numero di token rimanenti per il giocatore.
 * @property {number} punteggio_totale - Il punteggio totale accumulato dal giocatore.
 * @property {'utente' | 'admin'} ruolo - Il ruolo del giocatore (può essere 'utente' o 'admin').
 */
interface GiocatoreAttributes {
    id_giocatore?: number;
    nome: string;
    cognome: string;
    email: string;
    hash: string;
    token_residuo: number;
    punteggio_totale: number;
    ruolo: 'utente' | 'admin';
}

/**
 * @interface GiocatoreCreationAttributes
 * @description Interfaccia per gli attributi necessari alla creazione di un record di Giocatore.
 * L'ID del giocatore è opzionale poiché viene generato automaticamente.
 */
interface GiocatoreCreationAttributes extends Optional<GiocatoreAttributes, 'id_giocatore'> {}

/**
 * @class Giocatore
 * @extends {Model<GiocatoreAttributes, GiocatoreCreationAttributes>}
 * @description Modello Sequelize che rappresenta il giocatore. Include metodi per la gestione dei token e del punteggio,
 * oltre alle associazioni con altri modelli.
 *
 * @property {number} id_giocatore - L'ID del giocatore, generato automaticamente.
 * @property {string} nome - Il nome del giocatore.
 * @property {string} cognome - Il cognome del giocatore.
 * @property {string} email - L'email del giocatore, che deve essere univoca.
 * @property {string} hash - La password crittografata del giocatore.
 * @property {number} token_residuo - Il numero di token rimanenti per il giocatore.
 * @property {number} punteggio_totale - Il punteggio totale accumulato dal giocatore.
 * @property {'utente' | 'admin'} ruolo - Il ruolo del giocatore (può essere 'utente' o 'admin').
 * @property {Date} createdAt - Timestamp di creazione del record.
 * @property {Date} updatedAt - Timestamp di aggiornamento del record.
 */
class Giocatore extends Model<GiocatoreAttributes, GiocatoreCreationAttributes> implements GiocatoreAttributes {
    public id_giocatore!: number;
    public nome!: string;
    public cognome!: string;
    public email!: string;
    public hash!: string;
    public token_residuo!: number;
    public punteggio_totale!: number;
    public ruolo!: 'utente' | 'admin';

    // timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * @method sottraiToken
     * @description Sottrae una quantità specificata di token dal giocatore, se il saldo dei token residui è sufficiente.
     * @param {number} quantita - La quantità di token da sottrarre.
     * @returns {boolean} - Restituisce `true` se la sottrazione è avvenuta con successo,
     * `false` se i token non erano sufficienti.
     */
    public sottraiToken(quantita: number): boolean {
        if (this.token_residuo >= quantita) {
            this.token_residuo -= quantita;
            return true;
        }
        return false;
    }

    /**
     * @method aggiungiPunto
     * @description Aggiunge 1 punto al punteggio totale del giocatore.
     */
    public aggiungiPunto(): void {
        this.punteggio_totale += 1;
    }

    /**
     * @method sottraiPunto
     * @description Sottrae 0.5 punti al punteggio totale del giocatore in caso di abbandono della partita.
     */
    public sottraiPunto(): void {
        this.punteggio_totale -= 0.5;
    }

    /**
     * @method associate
     * @description Associa il modello Giocatore con il modello Mossa.
     * @param {any} models - I modelli associati.
     */
    static associate(models: any) {
        Giocatore.hasMany(models.Mossa, {
            foreignKey: 'id_giocatore',
            as: 'mosse',
        });
    }
}

/**
 * @function initGiocatore
 * @description Inizializza il modello Giocatore con gli attributi definiti e le opzioni di configurazione di Sequelize.
 *
 * @param {Sequelize} sequelize - L'istanza Sequelize per la connessione al database.
 * @returns {typeof Giocatore} - Restituisce il modello Giocatore inizializzato.
 */
export default (sequelize: Sequelize) => {
    Giocatore.init({
        id_giocatore: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cognome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token_residuo: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.45,
        },
        punteggio_totale: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        ruolo: {
            type: DataTypes.ENUM('utente', 'admin'),
            allowNull: false,
            defaultValue: 'utente',
        },
    }, {
        sequelize,
        modelName: 'Giocatore',
        tableName: 'Giocatore',
        timestamps: true,
    });

    return Giocatore;
};
