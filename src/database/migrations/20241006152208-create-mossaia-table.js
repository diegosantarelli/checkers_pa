'use strict';

/**
 * Migrazione per creare la tabella `MossaIA`.
 *
 * Questa tabella rappresenta le mosse effettuate dall'intelligenza artificiale
 * all'interno di una partita, con dettagli sul numero di mossa, la configurazione
 * della tavola, il pezzo spostato, la posizione dei pezzi e la data della mossa.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per gestire le query di database in Sequelize.
 * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
 *
 * @function up
 * @description Esegue la creazione della tabella `MossaIA` con le seguenti colonne:
 * - `id_mossa`: Chiave primaria, auto-incrementante.
 * - `numero_mossa`: Numero progressivo della mossa effettuata dall'IA, non può essere nullo.
 * - `tavola`: Stato della tavola di gioco in formato JSON, rappresenta la configurazione della tavola dopo la mossa dell'IA.
 * - `pezzo`: Tipo di pezzo spostato dall'IA (singolo o dama), può essere nullo.
 * - `id_partita`: Riferimento alla partita a cui la mossa appartiene, con cancellazione a cascata se la partita viene eliminata.
 * - `data`: Data e orario in cui la mossa è stata effettuata, con valore predefinito impostato all'orario attuale.
 * - `from_position`: Posizione di partenza del pezzo spostato dall'IA, non può essere nulla.
 * - `to_position`: Posizione di arrivo del pezzo spostato dall'IA, non può essere nulla.
 * - `createdAt`: Data di creazione del record, con valore predefinito impostato all'orario attuale.
 * - `updatedAt`: Data di aggiornamento del record, con valore predefinito impostato all'orario attuale.
 */


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MossaIA', {
      id_mossa: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      numero_mossa: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tavola: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      pezzo: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isIn: [['singolo', 'dama']],
        },
      },
      id_partita: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Partita',
          key: 'id_partita',
        },
        onDelete: 'CASCADE',
      },
      data: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
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
      }
    });
  },

  /**
   * @function down
   * @description Esegue la cancellazione della tabella `MossaIA`.
   *
   * @param queryInterface
   * @param Sequelize
   * @returns {Promise<void>} - Restituisce una promise risolta quando la tabella viene rimossa con successo.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MossaIA');
  }
};