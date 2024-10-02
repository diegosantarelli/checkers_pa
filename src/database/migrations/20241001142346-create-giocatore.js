'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Giocatore', { // Cambia [] in {}
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
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      punteggio_totale: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      ruolo: {
        type: Sequelize.STRING,
        defaultValue: 'giocatore',  // Può essere 'giocatore' o 'admin'
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
    }); // Nota la rimozione delle parentesi quadre
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('Giocatore');
  }
};
