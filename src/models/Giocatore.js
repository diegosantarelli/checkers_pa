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
            validate: {
                isEmail: true, // Verifica che l'email sia valida
            }
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false, // Assicurati di hashare la password prima di salvarla
        },
        token_residuo: {
            type: DataTypes.FLOAT, // Float per gestire valori decimali (come 0.0125 per ogni mossa)
            allowNull: false,
            defaultValue: 0.45, // Default di partenza
        },
        punteggio_totale: {
            type: DataTypes.FLOAT, // Anche qui un float in caso di punti parziali (come -0.5 per interruzione)
            allowNull: false,
            defaultValue: 0, // Default iniziale
        },
        ruolo: {
            type: DataTypes.ENUM('utente', 'admin'), // Limita i valori possibili
            allowNull: false,
            defaultValue: 'utente', // Ruolo predefinito
        },
    }, {
        sequelize,
        modelName: 'Giocatore',
    });

    return Giocatore;
};
