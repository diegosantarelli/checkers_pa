import { Model, DataTypes, Sequelize } from 'sequelize';

/**
 * @class Mossa
 * @extends Model
 * @classdesc Rappresenta il modello della tabella "Mossa" nel database.
 * Ogni istanza della classe rappresenta una singola mossa all'interno di una partita di dama.
 */
export default (sequelize: Sequelize) => {
    /**
     * @class Mossa
     * @description Modello Sequelize per la tabella "Mossa".
     */
    class Mossa extends Model {
        public id_mossa!: number;
        public numero_mossa!: number;
        public tavola!: object;
        public pezzo!: string | null;
        public id_partita!: number;
        public id_giocatore!: number;
        public from_position!: string; // Colonna per la posizione di origine della mossa
        public to_position!: string;   // Colonna per la posizione di destinazione della mossa
        public data!: Date;

        /**
         * @method associate
         * @description Metodo per definire le associazioni tra i modelli.
         * @param models - Gli altri modelli Sequelize con cui è associato il modello Mossa.
         */
        static associate(models: any) {
            Mossa.belongsTo(models.Partita, {
                foreignKey: 'id_partita',
                as: 'partita',
            });

            Mossa.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore',
                as: 'giocatore',
                constraints: false,
            });
        }
    }

    /**
     * @typedef {Object} MossaAttributes
     * @property {number} id_mossa - ID univoco della mossa.
     * @property {number} numero_mossa - Numero sequenziale della mossa.
     * @property {object} tavola - Stato della tavola dopo la mossa (in formato JSON).
     * @property {string|null} pezzo - Tipo di pezzo mosso ('singolo' o 'dama').
     * @property {number} id_partita - ID della partita associata alla mossa.
     * @property {number} id_giocatore - ID del giocatore che ha eseguito la mossa.
     * @property {string} from_position - Posizione di origine della mossa (in notazione scacchistica).
     * @property {string} to_position - Posizione di destinazione della mossa (in notazione scacchistica).
     * @property {Date} data - Data e ora in cui la mossa è stata eseguita.
     */

    /**
     * @function init
     * @memberof Mossa
     * @description Inizializza il modello Mossa con i suoi attributi e le relative configurazioni.
     * @param sequelize - L'istanza di Sequelize utilizzata per l'inizializzazione del modello.
     */
    Mossa.init({
        id_mossa: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        numero_mossa: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tavola: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        pezzo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        id_partita: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Partita',
                key: 'id_partita',
            },
            onDelete: 'CASCADE',
        },
        id_giocatore: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        from_position: {
            type: DataTypes.STRING,  // Registra la posizione di origine della mossa
            allowNull: false,
        },
        to_position: {
            type: DataTypes.STRING,  // Registra la posizione di destinazione della mossa
            allowNull: false,
        },
        data: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Mossa',
        tableName: 'Mossa',
        timestamps: true,
    });

    return Mossa;
};