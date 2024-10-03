'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Partita extends Model {
        static associate(models) {
            // Associazione con il Giocatore 1
            Partita.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore1',
                as: 'giocatore1',
            });
            // Associazione con il Giocatore 2
            Partita.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore2',
                as: 'giocatore2',
            });
            // Associazione con le mosse
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
                key: 'id_giocatore',  // Chiave primaria del modello Giocatore
            },
        },
        id_giocatore2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',  // Chiave primaria del modello Giocatore
            },
        },
        stato: {
            type: DataTypes.ENUM('in corso', 'completata', 'abbandonata'),
            allowNull: false,
            defaultValue: 'in corso', // Stato predefinito
        },
        data_inizio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Imposta la data di creazione automaticamente
        },
    }, {
        sequelize,
        modelName: 'Partita',
    });

    return Partita;
};
