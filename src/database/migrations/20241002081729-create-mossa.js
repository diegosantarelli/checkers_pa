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
          key: 'id_partita',  // Questo deve corrispondere esattamente alla colonna della chiave primaria in Partita
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
      },
      tipo_pezzo: {
        type: Sequelize.ENUM('singolo', 'dama'),
        allowNull: false,
      },
      direzione: {
        type: Sequelize.ENUM('avanti', 'indietro'),
        allowNull: false,
      },
      cattura: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      promozione: {
        type: Sequelize.BOOLEAN,
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
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Mossa');
  }
};