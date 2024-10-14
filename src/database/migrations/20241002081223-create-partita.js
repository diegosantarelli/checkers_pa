'use strict';

/**
 * Migrazione per creare la tabella `Partita`.
 *
 * Questa tabella rappresenta le partite giocate nel sistema, con dettagli
 * relativi al tipo di partita, stato, giocatori coinvolti, numero di mosse,
 * tempo totale e configurazione della tavola di gioco.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per gestire le query di database in Sequelize.
 * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
 *
 * @function up
 * @description Esegue la creazione della tabella `Partita` con le seguenti colonne:
 * - `id_partita`: Chiave primaria, auto-incrementante.
 * - `data_inizio`: Data di inizio della partita, con valore predefinito impostato all'orario attuale.
 * - `stato`: Lo stato della partita (in corso, completata, abbandonata).
 * - `tipo`: Il tipo di partita (Amichevole, Normale, Competitiva).
 * - `mosse_totali`: Numero di mosse effettuate nella partita, valore predefinito 0.
 * - `tempo_totale`: Tempo totale impiegato per la partita in secondi, valore predefinito 0.
 * - `livello_IA`: Il livello dell'intelligenza artificiale, se presente (facile, normale, difficile, estrema).
 * - `id_giocatore1`: Riferimento al giocatore 1, con cancellazione a cascata.
 * - `id_giocatore2`: Riferimento al giocatore 2, con eliminazione impostata su null se il giocatore viene rimosso.
 * - `id_vincitore`: Riferimento al vincitore della partita, impostato su null se il giocatore viene rimosso.
 * - `tavola`: Stato della tavola di gioco in formato JSON.
 *
 * @returns {Promise<void>} - Restituisce una promise risolta quando la tabella viene creata con successo.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Partita', {
      id_partita: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      data_inizio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      stato: {
        type: Sequelize.ENUM('in corso', 'completata', 'abbandonata'),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('Amichevole', 'Normale', 'Competitiva'),
        allowNull: false,
      },
      mosse_totali: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tempo_totale: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      livello_IA: {
        type: Sequelize.ENUM('facile', 'normale', 'difficile', 'estrema'),
        allowNull: true,
      },
      id_giocatore1: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      id_giocatore2: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: true,
        onDelete: 'SET NULL',
      },
      id_vincitore: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: true,
        onDelete: 'SET NULL',
      },
      tavola: {
        type: Sequelize.JSON,
        allowNull: false,
      }
    });
  },

  /**
   * @function down
   * @description Esegue la cancellazione della tabella `Partita`.
   *
   * @param queryInterface
   * @param Sequelize
   * @returns {Promise<void>} - Restituisce una promise risolta quando la tabella viene rimossa con successo.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Partita');
  }
};
