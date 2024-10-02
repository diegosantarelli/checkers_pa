'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Partita', { // Usa un oggetto invece di un array
      id_partita: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      data_creazione: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      stato: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token_iniziali: {
        type: Sequelize.INTEGER,
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
      id_giocatore1: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',  // Assicurati che il nome della tabella sia corretto
          key: 'id_giocatore',  // Assicurati che il campo di riferimento sia corretto
        },
        allowNull: false,
      },
      id_giocatore2: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: true,
      },
      id_ai: {
        type: Sequelize.INTEGER,
        references: {
          model: 'AI',
          key: 'id_ai',
        },
        allowNull: true,
      },
      id_vincitore: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: true,
      },
      vincitore_ai: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
    return queryInterface.dropTable('Partita');
  }
};
