'use strict';

/**
 * Migrazione per creare la tabella `Giocatore`.
 *
 * Questa tabella rappresenta i giocatori nel sistema, con informazioni personali,
 * credenziali di accesso, ruoli, token residuo e punteggio totale.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per gestire le query di database in Sequelize.
 * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
 *
 * @function up
 * @description Esegue la creazione della tabella `Giocatore` con le seguenti colonne:
 * - `id_giocatore`: Chiave primaria, auto-incrementante.
 * - `nome`: Nome del giocatore, non può essere nullo.
 * - `cognome`: Cognome del giocatore, non può essere nullo.
 * - `email`: Email univoca del giocatore, utilizzata per l'autenticazione, non può essere nulla.
 * - `hash`: Hash della password del giocatore, non può essere nullo.
 * - `token_residuo`: Numero di token disponibili per il giocatore, con valore predefinito di 0.45.
 * - `punteggio_totale`: Il punteggio totale accumulato dal giocatore, con valore predefinito di 0.0.
 * - `ruolo`: Ruolo del giocatore, può essere 'utente' o 'admin', con valore predefinito 'utente'.
 * - `createdAt`: Data di creazione del record, con valore predefinito impostato all'orario attuale.
 * - `updatedAt`: Data di aggiornamento del record, con valore predefinito impostato all'orario attuale.
 *
 * @returns {Promise<void>} - Restituisce una promise risolta quando la tabella viene creata con successo.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
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
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.45,
      },
      punteggio_totale: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      ruolo: {
        type: Sequelize.ENUM('utente', 'admin'),
        allowNull: false,
        defaultValue: 'utente',
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

  /**
   *
   * @function down
   * @description Esegue la cancellazione della tabella `Giocatore`.
   *
   * @param queryInterface
   * @param Sequelize
   * @returns {Promise<void>} - Restituisce una promise risolta quando la tabella viene rimossa con successo.
   */

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Giocatore');
  }
};