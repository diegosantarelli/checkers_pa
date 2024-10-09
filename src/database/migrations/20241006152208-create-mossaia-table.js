'use strict';

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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MossaIA');
  }
};