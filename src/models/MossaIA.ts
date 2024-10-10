import { Model, DataTypes, Sequelize } from 'sequelize';

/**
 * @class MossaIA
 * @extends {Model}
 * @classdesc Modello che rappresenta le mosse effettuate dall'intelligenza artificiale (IA) in una partita di dama.
 * Ogni istanza della classe rappresenta una singola mossa eseguita dall'IA durante una partita.
 */
export default (sequelize: Sequelize) => {
    /**
     * @class MossaIA
     * @description Modello Sequelize per la tabella "MossaIA", utilizzato per tracciare le mosse eseguite dall'intelligenza artificiale in una partita di dama.
     */
    class MossaIA extends Model {
        /**
         * @method associate
         * @description Metodo che definisce le associazioni tra il modello MossaIA e altri modelli.
         * Il modello MossaIA è associato al modello Partita.
         * @param {any} models - Gli altri modelli Sequelize con cui è associato il modello MossaIA.
         */
        static associate(models: any) {
            MossaIA.belongsTo(models.Partita, {
                foreignKey: 'id_partita',
                as: 'partita',
            });
        }
    }

    /**
     * @typedef {Object} MossaIAAttributes
     * @description Attributi del modello "MossaIA", che rappresentano una mossa eseguita dall'intelligenza artificiale in una partita di dama.
     *
     * @property {number} id_mossa - ID univoco della mossa IA.
     * @property {number} numero_mossa - Numero sequenziale della mossa IA.
     * @property {object} tavola - Stato della tavola dopo la mossa (in formato JSON).
     * @property {string|null} pezzo - Tipo di pezzo mosso dall'IA ('singolo' o 'dama').
     * @property {number} id_partita - ID della partita associata alla mossa IA.
     * @property {Date} data - Data e ora in cui la mossa IA è stata eseguita.
     */

    /**
     * @function init
     * @memberof MossaIA
     * @description Inizializza il modello MossaIA con i suoi attributi e le configurazioni di Sequelize.
     * @param {Sequelize} sequelize - L'istanza di Sequelize utilizzata per l'inizializzazione del modello.
     */
    MossaIA.init({
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
        data: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'MossaIA',
        tableName: 'MossaIA',
        timestamps: true,
    });

    return MossaIA;
};
