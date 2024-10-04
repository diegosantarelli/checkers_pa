'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Giocatore', {
      id_giocatore: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cognome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token_residuo: {
        type: Sequelize.FLOAT,  // Cambiato a FLOAT
        allowNull: false,        // Imposto non nullabile
        defaultValue: 0.45,      // Valore predefinito
      },
      punteggio_totale: {
        type: Sequelize.FLOAT,  // Anche qui, potrebbe essere più preciso usare FLOAT
        allowNull: false,
        defaultValue: 0.0,
      },
      ruolo: {
        type: Sequelize.ENUM('utente', 'admin'),  // Utilizzo di ENUM per valori specifici
        allowNull: false,
        defaultValue: 'utente',
      },
      JWT: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      }
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('Giocatore');
  }
};