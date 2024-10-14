'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Giocatore', {
      id_giocatore: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,  // Assicura che l'ID sia auto-incrementato per i giocatori reali
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
        unique: true,  // Imposta l'email come univoca per ogni giocatore
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token_residuo: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.45,  // Valore predefinito per i token residui
      },
      punteggio_totale: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,  // Valore predefinito per il punteggio totale
      },
      ruolo: {
        type: Sequelize.ENUM('utente', 'admin'),
        allowNull: false,
        defaultValue: 'utente',  // Imposta 'utente' come ruolo predefinito
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),  // Imposta la data di creazione automaticamente
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),  // Imposta la data di aggiornamento automaticamente
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Giocatore');
  }
};