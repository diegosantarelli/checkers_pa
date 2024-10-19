import { Model, DataTypes, Sequelize } from 'sequelize';

/**
 * @class Mossa
 * @extends {Model}
 * @classdesc Rappresenta il modello della tabella "Mossa" nel database.
 * Ogni istanza della classe rappresenta una singola mossa all'interno di una partita di dama.
 */
export default (sequelize: Sequelize) => {
    /**
     * @class Mossa
     * @description Modello Sequelize per la tabella "Mossa".
     * Ogni record rappresenta una mossa eseguita in una partita di dama, con informazioni sulla posizione di partenza,
     * di destinazione, il tipo di pezzo mosso e lo stato della tavola dopo la mossa.
     */
    class Mossa extends Model {
        public id_mossa!: number;
        public numero_mossa!: number; //type assertion, dice al compilatore che la variabile verrà inizializzata prima di essere utilizzata
        public tavola!: object;
        public pezzo!: string | null;
        public id_partita!: number;
        public id_giocatore!: number;
        public from_position!: string;
        public to_position!: string;
        public data!: Date;

        /**
         * @method associate
         * @description Metodo per definire le associazioni tra i modelli.
         * Associa il modello Mossa ai modelli Partita e Giocatore.
         * @param {any} models - Gli altri modelli Sequelize con cui è associato il modello Mossa.
         */
        static associate(models: any) {
            Mossa.belongsTo(models.Partita, { // relazione molti a uno tra Mossa e Partita
                foreignKey: 'id_partita',
                as: 'partita', // alias per accedere alla partita associata a una mossa
            });

            Mossa.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore',
                as: 'giocatore', // alias per accedere al giocatore associato a una mossa.
            });
        }
    }

    /**
     * @typedef {Object} MossaAttributes
     * @description Attributi del modello "Mossa", che rappresentano una mossa eseguita durante una partita.
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
     * @param {Sequelize} sequelize - L'istanza di Sequelize utilizzata per l'inizializzazione del modello.
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
            onDelete: 'CASCADE', //se una partita viene eliminata, tutte le mosse associate a quella partita verranno eliminate.
        },
        id_giocatore: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        from_position: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        to_position: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize, //istanza di Sequelize creata per connessione al database, necessaria per definire il modello e collegarlo al database.
        modelName: 'Mossa',
        tableName: 'Mossa',
        timestamps: true,
    });

    return Mossa;
};
