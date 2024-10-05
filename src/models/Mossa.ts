import { Model, DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    class Mossa extends Model {
        static associate(models: any) {
            Mossa.belongsTo(models.Partita, {
                foreignKey: 'id_partita',
                as: 'partita',
            });
            Mossa.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore',
                as: 'giocatore',
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
            type: DataTypes.STRING,  // Definisci il tipo per la colonna pezzo
            allowNull: true,  // Consenti valori null se pezzo non è sempre necessario
        },
        id_partita: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Partita',
                key: 'id_partita',
            },
        },
        id_giocatore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
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
    });

    return Mossa;
};