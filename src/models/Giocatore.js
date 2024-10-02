// src/models/Giocatore.js

'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Giocatore extends Model {
        static associate(models) {
            // Definisci le associazioni qui, se necessario
            Giocatore.hasMany(models.Mossa, {
                foreignKey: 'id_giocatore',
                as: 'mosse',
            });
        }
    }

    Giocatore.init({
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cognome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token_residuo: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        punteggio_totale: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ruolo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Giocatore',
    });

    return Giocatore;
};