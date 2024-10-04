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
        type: Sequelize.JSON, // Stato della scacchiera dopo la mossa
        allowNull: false,
      },
      id_partita: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Partita',
          key: 'id_partita',  // Deve corrispondere alla chiave primaria della tabella Partita
        },
        allowNull: false,
        onDelete: 'CASCADE', // Opzionale: elimina tutte le mosse quando la partita viene eliminata
      },
      id_giocatore: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Giocatore',
          key: 'id_giocatore',
        },
        allowNull: false,
        onDelete: 'CASCADE', // Opzionale: elimina tutte le mosse associate se il giocatore viene eliminato
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