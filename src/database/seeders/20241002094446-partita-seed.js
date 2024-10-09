'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  generateRandomBoardConfig() {
    const board = Array(32).fill(null); // Crea una tavola 32-caselle per i pezzi scuri (configurazione Draughts)

    // Popola la tavola con i pezzi iniziali per Giocatore 1 e Giocatore 2
    for (let i = 0; i < 12; i++) {
      board[i] = { dark: true, position: i, piece: { player: 'dark', king: false } }; // Giocatore 1
    }

    for (let i = 20; i < 32; i++) {
      board[i] = { dark: true, position: i, piece: { player: 'light', king: false } }; // Giocatore 2
    }

    return JSON.stringify({ initialBoard: board });
  },

  async up(queryInterface, Sequelize) {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()); // Un anno fa
    const endDate = currentDate; // Oggi

    await queryInterface.bulkInsert('Partita', [
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'completata',
        tipo: 'Competitiva',
        mosse_totali: 5,
        tempo_totale: 60,
        id_giocatore1: 1,
        id_giocatore2: null,
        id_vincitore: 1,
        vincitore_ai: false,
        livello_IA: 'facile',
        tavola: this.generateRandomBoardConfig(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'in corso',
        tipo: 'Amichevole',
        mosse_totali: 8,
        tempo_totale: 90,
        id_giocatore1: 4,
        id_giocatore2: null,
        id_vincitore: null,
        vincitore_ai: null,
        livello_IA: 'facile',
        tavola: this.generateRandomBoardConfig(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'completata',
        tipo: 'Amichevole',
        mosse_totali: 8,
        tempo_totale: 90,
        id_giocatore1: 2,
        id_giocatore2: 3,
        id_vincitore: 2,
        vincitore_ai: null,
        livello_IA: null,
        tavola: this.generateRandomBoardConfig(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'completata',
        tipo: 'Amichevole',
        mosse_totali: 5,
        tempo_totale: 60,
        id_giocatore1: 3,
        id_giocatore2: 1,
        id_vincitore: 3,
        vincitore_ai: null,
        livello_IA: null,
        tavola: this.generateRandomBoardConfig(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Partita', null, {});
  }
};