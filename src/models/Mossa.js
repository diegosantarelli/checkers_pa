// src/models/Mossa.js

'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Mossa extends Model {
        static associate(models) {
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
    });

    return Mossa;
};