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
     * @description Modello Sequelize per la tabella "MossaIA", utilizzato per tracciare le mosse eseguite
     * dall'intelligenza artificiale in una partita di dama.
     */
    class MossaIA extends Model {
        public id_mossa!: number;
        public numero_mossa!: number; //type assertion, dice al compilatore che la variabile verrà inizializzata prima di essere utilizzata
        public tavola!: object;
        public pezzo!: string | null;
        public id_partita!: number;
        public from_position!: string;
        public to_position!: string;
        public data!: Date;

        /**
         * @method associate
         * @description Metodo che definisce le associazioni tra il modello MossaIA e altri modelli.
         * Il modello MossaIA è associato al modello Partita.
         * @param {any} models - Gli altri modelli Sequelize con cui è associato il modello MossaIA.
         */
        static associate(models: any) {
            MossaIA.belongsTo(models.Partita, { // molti a uno con Partita
                foreignKey: 'id_partita',
                as: 'partita', // alias per accedere alla partita associata a una mossa
            });
        }
    }

    /**
     * Inizializza il modello MossaIA con i suoi attributi e le configurazioni di Sequelize.
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
            onDelete: 'CASCADE', //se una partita viene eliminata, tutte le mosse associate a quella partita verranno eliminate.
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
        modelName: 'MossaIA',
        tableName: 'MossaIA',
        timestamps: true,
    });

    return MossaIA;
};