// src/models/Partita.js

'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Partita extends Model {
        static associate(models) {
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
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'in corso', // Stato predefinito
        },
        data_inizio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Partita',
    });

    return Partita;
};