'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mossa', [
      {
        numero_mossa: 1,
        tavola: JSON.stringify({ /* Configurazione della tavola */ }),
        id_partita: 1, // Assicurati che questo ID esista nella tabella Partita
        id_giocatore: 1, // ID del giocatore che ha effettuato la mossa
        data: new Date(), // Data e ora della mossa
        pezzo: 'singolo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero_mossa: 2,
        tavola: JSON.stringify({ /* Configurazione della tavola */ }),
        id_partita: 1, // ID della partita a cui si riferisce la mossa
        id_giocatore: 2, // ID del secondo giocatore
        data: new Date(),
        pezzo: 'singolo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero_mossa: 2,
        tavola: JSON.stringify({ /* Configurazione della tavola */ }),
        id_partita: 2, // ID della seconda partita
        id_giocatore: 1, // ID del giocatore che ha effettuato la mossa
        data: new Date(),
        pezzo: 'dama',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero_mossa: 1,
        tavola: JSON.stringify({ /* Configurazione della tavola */ }),
        id_partita: 2, // ID della seconda partita
        id_giocatore: 3, // ID del secondo giocatore
        data: new Date(),
        pezzo: 'dama',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Aggiungi ulteriori mosse qui se necessario
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mossa', null, {});
  }
};

