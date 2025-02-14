import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

/**
 * @interface PartitaAttributes
 * @description Definisce gli attributi della tabella `Partita`.
 *
 * @property {number} id_partita - ID univoco della partita.
 * @property {number} id_giocatore1 - ID del primo giocatore.
 * @property {number | null} id_giocatore2 - ID del secondo giocatore (può essere null se si gioca contro l'IA).
 * @property {'facile' | 'normale' | 'difficile' | 'estrema' | null} livello_IA - Livello dell'IA nella partita(se applicabile).
 * @property {'in corso' | 'completata' | 'abbandonata'} stato - Stato corrente della partita.
 * @property {'Amichevole' | 'Normale' | 'Competitiva'} tipo - Tipo di partita.
 * @property {any} tavola - Stato della tavola di gioco in formato JSON.
 * @property {Date} data_inizio - Data di inizio della partita.
 * @property {number | null} id_vincitore - ID del giocatore che ha vinto la partita (null se non è stato deciso).
 * @property {number} mosse_totali - Numero totale di mosse eseguite nella partita.
 * @property {number} tempo_totale - Tempo totale della partita in secondi.
 */
interface PartitaAttributes {
    id_partita: number;
    id_giocatore1: number;
    id_giocatore2: number | null;
    livello_IA: 'facile' | 'normale' | 'difficile' | 'estrema' | null;
    stato: 'in corso' | 'completata' | 'abbandonata';
    tipo: 'Amichevole' | 'Normale' | 'Competitiva';
    tavola: any;
    data_inizio: Date;
    id_vincitore: number | null;
    mosse_totali: number;
    tempo_totale: number;
}

/**
 * @interface PartitaCreationAttributes
 * @description Definisce gli attributi opzionali per la creazione di una nuova partita.
 */
interface PartitaCreationAttributes extends Optional<PartitaAttributes, 'id_partita' | 'data_inizio' | 'id_vincitore' | 'mosse_totali' | 'tempo_totale'> {}

/**
 * @class Partita
 * @extends {Model<PartitaAttributes, PartitaCreationAttributes>} - Partita eredita tutte le funzionalità di Sequelize
 * per interagire con il database, come la creazione, l'aggiornamento, la cancellazione e la lettura di record dal database.
 * @description Rappresenta il modello Sequelize per la tabella `Partita`.
 * Ogni istanza della classe `Partita` rappresenta una partita di dama.
 */
class Partita extends Model<PartitaAttributes, PartitaCreationAttributes> implements PartitaAttributes {
    public id_partita!: number;
    public id_giocatore1!: number;
    public id_giocatore2!: number | null;
    public livello_IA!: 'facile' | 'normale' | 'difficile' | 'estrema' | null;
    public stato!: 'in corso' | 'completata' | 'abbandonata';
    public tipo!: 'Amichevole' | 'Normale' | 'Competitiva';
    public tavola!: any;
    public data_inizio!: Date;
    public id_vincitore!: number | null;
    public mosse_totali!: number;
    public tempo_totale!: number;

    /**
     * @method associate
     * @description Definisce le associazioni del modello `Partita` con altri modelli.
     * Associa il modello `Partita` ai modelli `Giocatore` e `Mossa`.
     * @param {any} models - Gli altri modelli Sequelize.
     */
    static associate(models: any) {
        Partita.belongsTo(models.Giocatore, { as: 'giocatore1', foreignKey: 'id_giocatore1' });
        Partita.belongsTo(models.Giocatore, { as: 'giocatore2', foreignKey: 'id_giocatore2' });
        Partita.hasMany(models.Mossa, { foreignKey: 'id_partita', as: 'mosse' });
    }
}

/**
 * @function
 * @name initPartita
 * @description Inizializza il modello `Partita` con gli attributi definiti e le opzioni di configurazione di Sequelize.
 *
 * @param {Sequelize} sequelize - L'istanza di Sequelize utilizzata per la connessione al database.
 * @returns {Partita} - Il modello `Partita` inizializzato.
 */
export default (sequelize: Sequelize) => {
    Partita.init({
        id_partita: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_giocatore1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
        },
        id_giocatore2: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
        },
        livello_IA: {
            type: DataTypes.ENUM('facile', 'normale', 'difficile', 'estrema'),
            allowNull: true,
        },
        stato: {
            type: DataTypes.ENUM('in corso', 'completata', 'abbandonata'),
            allowNull: false,
            defaultValue: 'in corso',
        },
        tipo: {
            type: DataTypes.ENUM('Amichevole', 'Normale', 'Competitiva'),
            allowNull: false,
        },
        tavola: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        data_inizio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        id_vincitore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
        },
        mosse_totali: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        tempo_totale: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        sequelize, //istanza di Sequelize creata per connessione al database, necessaria per definire il modello e collegarlo al database.
        modelName: 'Partita',
        tableName: 'Partita',
        timestamps: false,
    });

    return Partita;
};
