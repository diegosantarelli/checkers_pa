/*
  "0": indica una cella vuota.
  "P1": indica un pezzo normale del Giocatore 1.
  "P2": indica un pezzo normale del Giocatore 2.
  "D1": indica una dama del Giocatore 1.
  "D2": indica una dama del Giocatore 2.
*/
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mossa', [
      // Prima mossa del Giocatore 1
      {
        numero_mossa: 1,
        tavola: JSON.stringify({
          scacchiera: [
            ["0", "P2", "0", "P2", "0", "P2", "0", "P2"],
            ["P2", "0", "P2", "0", "P2", "0", "P2", "0"],
            ["0", "P2", "0", "P2", "0", "P2", "0", "P2"],
            ["0", "0", "0", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "0", "0", "0", "0"],
            ["P1", "0", "P1", "0", "P1", "0", "P1", "0"],
            ["0", "P1", "0", "P1", "0", "P1", "0", "P1"],
            ["P1", "0", "P1", "0", "P1", "0", "P1", "0"]
          ]
        }),
        id_partita: 1,
        id_giocatore: 1,
        data: new Date(),
        pezzo: 'singolo',
        tipo_pezzo: 'singolo',
        direzione: 'avanti',
        cattura: false,
        promozione: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Mossa di cattura del Giocatore 2
      {
        numero_mossa: 2,
        tavola: JSON.stringify({
          scacchiera: [
            ["0", "P2", "0", "P2", "0", "P2", "0", "P2"],
            ["P2", "0", "P2", "0", "P2", "0", "P2", "0"],
            ["0", "P2", "0", "0", "0", "P2", "0", "P2"],
            ["0", "0", "P2", "0", "0", "0", "0", "0"],
            ["0", "0", "0", "0", "P1", "0", "0", "0"],
            ["P1", "0", "0", "0", "P1", "0", "P1", "0"],
            ["0", "P1", "0", "P1", "0", "P1", "0", "P1"],
            ["P1", "0", "P1", "0", "P1", "0", "P1", "0"]
          ]
        }),
        id_partita: 1,
        id_giocatore: 2,
        data: new Date(),
        pezzo: 'singolo',
        tipo_pezzo: 'singolo',
        direzione: 'avanti',
        cattura: true, // Cattura di un pezzo del Giocatore 1
        promozione: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Promozione a dama del Giocatore 1
      {
        numero_mossa: 3,
        tavola: JSON.stringify({
          scacchiera: [
            ["0", "P2", "0", "P2", "0", "P2", "0", "P2"],
            ["P2", "0", "P2", "0", "P2", "0", "P2", "0"],
            ["0", "P2", "0", "0", "0", "P2", "0", "P2"],
            ["0", "0", "0", "0", "P1", "0", "0", "0"],
            ["0", "0", "0", "P1", "0", "0", "0", "0"],
            ["P1", "0", "0", "0", "0", "0", "P1", "0"],
            ["0", "P1", "0", "P1", "0", "P1", "0", "P1"],
            ["P1", "0", "D1", "0", "P1", "0", "P1", "0"] // Giocatore 1 promuove un pezzo a dama
          ]
        }),
        id_partita: 1,
        id_giocatore: 1,
        data: new Date(),
        pezzo: 'singolo',
        tipo_pezzo: 'singolo',
        direzione: 'avanti',
        cattura: false,
        promozione: true, // Promozione a dama
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Mossa indietro della dama del Giocatore 2
      {
        numero_mossa: 4,
        tavola: JSON.stringify({
          scacchiera: [
            ["0", "P2", "0", "P2", "0", "P2", "0", "P2"],
            ["P2", "0", "P2", "0", "P2", "0", "P2", "0"],
            ["0", "P2", "0", "0", "0", "P2", "0", "P2"],
            ["0", "0", "0", "0", "P1", "0", "0", "0"],
            ["0", "0", "0", "P1", "0", "0", "0", "0"],
            ["P1", "0", "0", "0", "0", "0", "P1", "0"],
            ["0", "P1", "0", "P1", "0", "P1", "0", "P1"],
            ["P1", "0", "D1", "0", "P1", "0", "D2", "0"] // Dama del Giocatore 2 si muove indietro
          ]
        }),
        id_partita: 1,
        id_giocatore: 2,
        data: new Date(),
        pezzo: 'dama',
        tipo_pezzo: 'dama',
        direzione: 'indietro', // Movimento indietro della dama
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