'use strict';

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
        onDelete: 'CASCADE', // Se un giocatore viene eliminato, elimina la partita associata
      },
      id_giocatore2: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: true,
        onDelete: 'SET NULL', // Se il secondo giocatore viene eliminato, imposta il campo a NULL
      },
      id_ai: {
        type: Sequelize.INTEGER,
        references: {
          model: 'AI',
          key: 'id_ai',
        },
        allowNull: true,
        onDelete: 'SET NULL', // Se l'AI viene eliminato, imposta il campo a NULL
      },
      id_vincitore: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: true,
        onDelete: 'SET NULL', // Se il vincitore viene eliminato, imposta il campo a NULL
      },
      vincitore_ai: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      tavola: {
        type: Sequelize.JSON,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Partita');
  }
};
