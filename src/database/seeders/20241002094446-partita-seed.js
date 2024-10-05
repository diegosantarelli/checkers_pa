'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  generateRandomBoardConfig() {
    const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)); // Crea una tavola 8x8 vuota

    // Popola la tavola con i pezzi iniziali casuali
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) { // Solo celle scure
          if (row < 3) {
            board[row][col] = 'b'; // Giocatore 1
          } else if (row > 4) {
            board[row][col] = 'w'; // Giocatore 2
          }
        }
      }
    }

    // Restituisci la configurazione come oggetto
    return board;
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
        id_ai: 1,
        id_vincitore: 1,
        vincitore_ai: true,
        livello_IA: 'facile',
        tavola: JSON.stringify(this.generateRandomBoardConfig()), // Tavola inizializzata con configurazione casuale
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'completata',
        tipo: 'Normale',
        mosse_totali: 10,
        tempo_totale: 120,
        id_giocatore1: 2,
        id_giocatore2: 3,
        id_ai: null,
        id_vincitore: 2,
        vincitore_ai: false,
        livello_IA: null,
        tavola: JSON.stringify(this.generateRandomBoardConfig()), // Tavola inizializzata con configurazione casuale
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'completata',
        tipo: 'Amichevole',
        mosse_totali: 8,
        tempo_totale: 90,
        id_giocatore1: 4,
        id_giocatore2: 3,
        id_ai: null,
        id_vincitore: 4,
        vincitore_ai: false,
        livello_IA: null,
        tavola: JSON.stringify(this.generateRandomBoardConfig()), // Tavola inizializzata con configurazione casuale
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'in corso',
        tipo: 'Amichevole',
        mosse_totali: 3,
        tempo_totale: 30,
        id_giocatore1: 4,
        id_giocatore2: null,
        id_ai: 2,
        id_vincitore: null,
        vincitore_ai: null,
        livello_IA: 'estrema',
        tavola: JSON.stringify(this.generateRandomBoardConfig()), // Tavola inizializzata con configurazione casuale
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Partita', null, {});
  }
};