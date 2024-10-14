'use strict';

/**
 * Migrazione per creare la tabella `Mossa`.
 *
 * Questa tabella rappresenta le mosse effettuate all'interno di una partita,
 * con dettagli sul numero di mossa, la configurazione della tavola, i giocatori
 * coinvolti, la posizione dei pezzi e la data della mossa.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per gestire le query di database in Sequelize.
 * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
 *
 * @function up
 * @description Esegue la creazione della tabella `Mossa` con le seguenti colonne:
 * - `id_mossa`: Chiave primaria, auto-incrementante.
 * - `numero_mossa`: Numero progressivo della mossa all'interno della partita, non può essere nullo.
 * - `tavola`: Stato della tavola di gioco in formato JSON, rappresenta la configurazione della tavola dopo la mossa.
 * - `id_partita`: Riferimento alla partita a cui la mossa appartiene, con cancellazione a cascata se la partita viene eliminata.
 * - `id_giocatore`: Riferimento al giocatore che ha effettuato la mossa, con cancellazione a cascata se il giocatore viene eliminato.
 * - `data`: Data e orario in cui la mossa è stata effettuata, con valore predefinito impostato all'orario attuale.
 * - `pezzo`: Tipo di pezzo spostato (singolo o dama), deve essere uno di questi due valori.
 * - `from_position`: Posizione di partenza del pezzo spostato, non può essere nulla.
 * - `to_position`: Posizione di arrivo del pezzo spostato, non può essere nulla.
 * - `createdAt`: Data di creazione del record, con valore predefinito impostato all'orario attuale.
 * - `updatedAt`: Data di aggiornamento del record, con valore predefinito impostato all'orario attuale.
 *
 * @returns {Promise<void>} - Restituisce una promise risolta quando la tabella viene creata con successo.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mossa', {
      id_mossa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      numero_mossa: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tavola: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      id_partita: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Partita',
          key: 'id_partita',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      id_giocatore: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      data: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      pezzo: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['singolo', 'dama']],
        },
      },
      from_position: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      to_position: {
        type: Sequelize.STRING,
        allowNull: false,
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
      },
    });
  },

  /**
   * @function down
   * @description Esegue la cancellazione della tabella `Mossa`.
   *
   * @param queryInterface
   * @param Sequelize
   * @returns {Promise<void>} - Restituisce una promise risolta quando la tabella viene rimossa con successo.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mossa');
  }
};