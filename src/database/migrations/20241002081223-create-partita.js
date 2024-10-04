'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Partita', {
      id_partita: {  // Assicurati che questa colonna sia chiamata 'id_partita'
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
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token_iniziali: {
        type: Sequelize.FLOAT,
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
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_giocatore1: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
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
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Partita');
  }
};