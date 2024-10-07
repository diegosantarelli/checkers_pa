import { Model, DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    class Mossa extends Model {
        id_mossa!: number;
        numero_mossa!: number;
        tavola!: object;  // Aggiungi la definizione di tavola
        pezzo!: string | null;
        id_partita!: number;
        id_giocatore!: number;
        data!: Date;

        static associate(models: any) {
            // Associazione con il modello Partita
            Mossa.belongsTo(models.Partita, {
                foreignKey: 'id_partita',
                as: 'partita',
            });

            // Associazione con il modello Giocatore
            Mossa.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore',
                as: 'giocatore',
                constraints: false,
            });
        }
    }

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
            allowNull: true,  // Consenti valori null per pezzo, opzionale
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
            allowNull: false,  // Manteniamo il vincolo NOT NULL
            defaultValue: -1,  // Impostiamo -1 come valore predefinito per mosse dell'IA
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
        timestamps: true,  // Per avere createdAt e updatedAt
    });

    return Mossa;
};
