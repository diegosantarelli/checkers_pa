'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Partita', [
      {
        data_creazione: new Date(),
        stato: 'Completata',
        tipo: 'Competitiva',
        token_iniziali: 10,
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
        data_creazione: new Date(),
        stato: 'Completata',
        tipo: 'Normale',
        token_iniziali: 20,
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
        data_creazione: new Date(),
        stato: 'Completata',
        tipo: 'Amichevole',
        token_iniziali: 15,
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
        data_creazione: new Date(),
        stato: 'In corso', // Partita in corso
        tipo: 'Amichevole',
        token_iniziali: 15,
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

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Partita', null, {});
  }
};
