'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {

  getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  async up(queryInterface, Sequelize) {

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()); // Un anno fa
    const endDate = currentDate; // Oggi

    await queryInterface.bulkInsert('Partita', [
      {
        data_inizio: this.getRandomDate(startDate, endDate), // Corretto a `data_inizio`
        stato: 'Completata',
        tipo: 'Competitiva',
        mosse_totali: 5,
        tempo_totale: 60,
        id_giocatore1: 1, // ID del primo giocatore (assicurati che esista)
        id_giocatore2: null, // Nessun secondo giocatore
        id_ai: 1, // ID dell'AI
        id_vincitore: 1, // L'AI vince
        vincitore_ai: true, // L'AI è il vincitore
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate), // Corretto a `data_inizio`
        stato: 'Completata',
        tipo: 'Normale',
        mosse_totali: 10,
        tempo_totale: 120,
        id_giocatore1: 2, // ID del primo giocatore
        id_giocatore2: 3, // ID del secondo giocatore
        id_ai: null, // Nessuna AI presente
        id_vincitore: 2, // Giocatore 2 vince
        vincitore_ai: false, // Il vincitore è un giocatore
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate), // Corretto a `data_inizio`
        stato: 'Completata',
        tipo: 'Amichevole',
        mosse_totali: 8,
        tempo_totale: 90,
        id_giocatore1: 4, // ID del primo giocatore
        id_giocatore2: 3, // ID del secondo giocatore
        id_ai: null, // Nessuna AI presente
        id_vincitore: 4, // Giocatore 1 vince
        vincitore_ai: false, // Il vincitore è un giocatore
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        data_inizio: this.getRandomDate(startDate, endDate), // Corretto a `data_inizio`
        stato: 'In corso', // Partita in corso
        tipo: 'Amichevole',
        mosse_totali: 3, // Alcune mosse già effettuate
        tempo_totale: 30, // Tempo totale trascorso
        id_giocatore1: 4, // ID del primo giocatore
        id_giocatore2: null, // Nessun secondo giocatore
        id_ai: 2, // ID dell'AI
        id_vincitore: null, // Non c'è vincitore ancora
        vincitore_ai: null, // Non c'è vincitore ancora
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Partita', null, {});
  }
};