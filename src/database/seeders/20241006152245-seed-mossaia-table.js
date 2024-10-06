'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('MossaIA', [
      {
        numero_mossa: 1,
        tavola: JSON.stringify({ initialBoard: [{ dark: false }, { dark: true, position: 1, piece: { player: 'dark', king: false } }, { dark: false },
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
            { dark: true, position: 31, piece: { player: 'light', king: false } },] }), // Inserisci la configurazione della tavola IA
        pezzo: 'singolo',
        id_partita: 1,  // Associa alla partita
        data: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero_mossa: 2,
        tavola: JSON.stringify({ initialBoard: [{ dark: false }, { dark: true, position: 1, piece: { player: 'dark', king: false } }, { dark: false },
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
            { dark: true, position: 31, piece: { player: 'light', king: false } },] }), // Inserisci la configurazione della tavola IA
        pezzo: 'dama',
        id_partita: 1,  // Associa alla partita
        data: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('MossaIA', null, {});
  }
};