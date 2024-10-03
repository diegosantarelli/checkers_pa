'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Mossa extends Model {
        static associate(models) {
            // Associazione con la Partita
            Mossa.belongsTo(models.Partita, {
                foreignKey: 'id_partita',
                as: 'partita',
            });
            // Associazione con il Giocatore
            Mossa.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore',
                as: 'giocatore',
            });
        }
    }

    Mossa.init({
        numero_mossa: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tavola: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        id_partita: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Partita',
                key: 'id_partita',  // Assicurati che la chiave primaria di 'Partita' sia corretta
            },
        },
        id_giocatore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',  // Assicurati che la chiave primaria di 'Giocatore' sia corretta
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
    });

    return Mossa;
};
