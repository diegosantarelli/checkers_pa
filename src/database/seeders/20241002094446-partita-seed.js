'use strict';

module.exports = {

  /**
   * Genera una data casuale compresa tra due date specifiche.
   *
   * @param {Date} start - La data di inizio del range.
   * @param {Date} end - La data di fine del range.
   * @returns {Date} - Una data casuale compresa tra `start` e `end`.
   */
  getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  /**
   * Genera una configurazione casuale della tavola di gioco per la dama.
   * La tavola viene rappresentata come un array di 32 caselle con pezzi iniziali per due giocatori.
   *
   * @returns {string} - La configurazione della tavola di gioco come stringa JSON.
   */
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

  /**
   * Seeder per inserire dati di esempio nella tabella `Partita`.
   *
   * Questo seeder inserisce un insieme di partite con configurazioni casuali.
   *
   * @param {object} queryInterface - L'interfaccia utilizzata per eseguire le query di inserimento in Sequelize.
   * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
   * @returns {Promise<void>} - Restituisce una promise risolta quando i dati vengono inseriti con successo.
   */
  async up(queryInterface, Sequelize) {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
    const endDate = currentDate;

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
        livello_IA: 'facile',
        tavola: this.generateRandomBoardConfig(),
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
        livello_IA: 'facile',
        tavola: this.generateRandomBoardConfig(),
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
        livello_IA: null,
        tavola: this.generateRandomBoardConfig(),
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
        livello_IA: null,
        tavola: this.generateRandomBoardConfig(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate),
        stato: 'completata',
        tipo: 'Normale',
        mosse_totali: 10,
        tempo_totale: 180,
        id_giocatore1: 2,
        id_giocatore2: 4,
        id_vincitore: 4,
        livello_IA: null,
        tavola: this.generateRandomBoardConfig(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Partita', null, {});
  }
};