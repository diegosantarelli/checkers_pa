'use strict';

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
      cattura: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      promozione: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      // Aggiunte le nuove colonne per la posizione della mossa
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mossa');
  }
};