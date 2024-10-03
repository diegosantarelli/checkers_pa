import { Model, DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    class Partita extends Model {
        static associate(models: any) {
            // Associazioni con i giocatori e le mosse
            Partita.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore1',
                as: 'giocatore1',
            });
            Partita.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore2',
                as: 'giocatore2',
            });
            Partita.hasMany(models.Mossa, {
                foreignKey: 'id_partita',
                as: 'mosse',
            });
        }
    }

    Partita.init({
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
            allowNull: false,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
        },
        stato: {
            type: DataTypes.ENUM('in corso', 'completata', 'abbandonata'),
            allowNull: false,
            defaultValue: 'in corso',
        },
        data_inizio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Partita',
    });

    return Partita;
};
