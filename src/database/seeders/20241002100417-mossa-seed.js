'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mossa', [
      // Prima mossa del Giocatore 1
      {
        numero_mossa: 1,
        tavola: JSON.stringify({
          initialBoard: [
            { dark: false }, { dark: true, position: 1, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 2, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 3, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 4, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 5, piece: { player: 'dark', king: false } },
            { dark: false }, { dark: true, position: 6, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 7, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 8, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 9, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 10, piece: { player: 'dark', king: false } },
            { dark: true, position: 11 }, { dark: false }, { dark: true, position: 12 }, { dark: false },
            { dark: true, position: 13 }, { dark: false }, { dark: true, position: 14 }, { dark: false },
            { dark: true, position: 15 }, { dark: false }, { dark: true, position: 16 }, { dark: false },
            { dark: true, position: 17 }, { dark: false }, { dark: true, position: 18 }, { dark: false },
            { dark: true, position: 19 }, { dark: false }, { dark: true, position: 20 }, { dark: false },
            { dark: true, position: 21 }, { dark: false }, { dark: true, position: 22 }, { dark: false },
            { dark: true, position: 23 }, { dark: false }, { dark: true, position: 24 }, { dark: false },
            { dark: true, position: 25, piece: { player: 'light', king: false } }, { dark: true, position: 26, piece: { player: 'light', king: false } },
            { dark: false }, { dark: true, position: 27, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 28, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 29, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 30, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 31, piece: { player: 'light', king: false } },
          ]
        }),
        id_partita: 1,
        id_giocatore: 1,
        data: new Date(),
        pezzo: 'singolo',
        cattura: false,
        promozione: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Mossa di cattura del Giocatore 2
      {
        numero_mossa: 2,
        tavola: JSON.stringify({
          initialBoard: [
            { dark: false }, { dark: true, position: 1, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 2, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 3, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 4, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 5, piece: { player: 'dark', king: false } },
            { dark: false }, { dark: true, position: 6, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 7, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 8, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 9, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 10, piece: { player: 'dark', king: false } },
            { dark: true, position: 11 }, { dark: false }, { dark: true, position: 12, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 13 }, { dark: false }, { dark: true, position: 14, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 15 }, { dark: false }, { dark: true, position: 16 }, { dark: false },
            { dark: true, position: 17 }, { dark: false }, { dark: true, position: 18 }, { dark: false },
            { dark: true, position: 19 }, { dark: false }, { dark: true, position: 20 }, { dark: false },
            { dark: true, position: 21 }, { dark: false }, { dark: true, position: 22 }, { dark: false },
            { dark: true, position: 23 }, { dark: false }, { dark: true, position: 24 }, { dark: false },
            { dark: true, position: 25, piece: { player: 'light', king: false } }, { dark: true, position: 26, piece: { player: 'light', king: false } },
            { dark: false }, { dark: true, position: 27, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 28, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 29, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 30, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 31, piece: { player: 'light', king: false } },
          ]
        }),
        id_partita: 1,
        id_giocatore: 2,
        data: new Date(),
        pezzo: 'singolo',
        cattura: true, // Cattura di un pezzo del Giocatore 1
        promozione: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Promozione a dama del Giocatore 1
      {
        numero_mossa: 3,
        tavola: JSON.stringify({
          initialBoard: [
            { dark: false }, { dark: true, position: 1, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 2, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 3, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 4, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 5, piece: { player: 'dark', king: false } },
            { dark: false }, { dark: true, position: 6, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 7, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 8, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 9, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 10, piece: { player: 'dark', king: false } },
            { dark: true, position: 11 }, { dark: false }, { dark: true, position: 12 }, { dark: false },
            { dark: true, position: 13 }, { dark: false }, { dark: true, position: 14, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 15 }, { dark: false }, { dark: true, position: 16 }, { dark: false },
            { dark: true, position: 17 }, { dark: false }, { dark: true, position: 18 }, { dark: false },
            { dark: true, position: 19 }, { dark: false }, { dark: true, position: 20 }, { dark: false },
            { dark: true, position: 21 }, { dark: false }, { dark: true, position: 22 }, { dark: false },
            { dark: true, position: 23 }, { dark: false }, { dark: true, position: 24, piece: { player: 'light', king: true } },
            { dark: false }, { dark: true, position: 25 }, { dark: false },
            { dark: true, position: 26, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 27, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 28, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 29, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 30, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 31, piece: { player: 'light', king: false } },
          ]
        }),
        id_partita: 1,
        id_giocatore: 1,
        data: new Date(),
        pezzo: 'dama',
        cattura: false,
        promozione: true, // Promozione a dama
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Mossa indietro della dama del Giocatore 2
      {
        numero_mossa: 4,
        tavola: JSON.stringify({
          initialBoard: [
            { dark: false }, { dark: true, position: 1, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 2, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 3, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 4, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 5, piece: { player: 'dark', king: false } },
            { dark: false }, { dark: true, position: 6, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 7, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 8, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 9, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 10, piece: { player: 'dark', king: false } },
            { dark: true, position: 11 }, { dark: false }, { dark: true, position: 12, piece: { player: 'light', king: true } }, { dark: false },
            { dark: true, position: 13 }, { dark: false }, { dark: true, position: 14, piece: { player: 'dark', king: false } }, { dark: false },
            { dark: true, position: 15 }, { dark: false }, { dark: true, position: 16 }, { dark: false },
            { dark: true, position: 17 }, { dark: false }, { dark: true, position: 18 }, { dark: false },
            { dark: true, position: 19 }, { dark: false }, { dark: true, position: 20 }, { dark: false },
            { dark: true, position: 21 }, { dark: false }, { dark: true, position: 22 }, { dark: false },
            { dark: true, position: 23 }, { dark: false }, { dark: true, position: 24, piece: { player: 'light', king: true } },
            { dark: false }, { dark: true, position: 25 }, { dark: false },
            { dark: true, position: 26, piece: { player: 'light', king: true } }, { dark: false },
            { dark: true, position: 27, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 28, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 29, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 30, piece: { player: 'light', king: false } }, { dark: false },
            { dark: true, position: 31, piece: { player: 'light', king: false } },
          ]
        }),
        id_partita: 1,
        id_giocatore: 2,
        data: new Date(),
        pezzo: 'dama',
        cattura: false,
        promozione: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mossa', null, {});
  }
};