'use strict';

const bcrypt = require('bcrypt'); // Assicurati di importare bcrypt

module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 12;  // Numero di cicli di hashing

    // Inserisci i giocatori nel database
    return queryInterface.bulkInsert('Giocatore', [{
      nome: 'Simone',
      cognome: 'Recinelli',
      email: 'simone@example.com',
      hash: await bcrypt.hash('progavanzata', saltRounds),
      token_residuo: 10,
      punteggio_totale: 100,
      ruolo: 'utente',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Diego',
      cognome: 'Santarelli',
      email: 'diego@example.com',
      hash: await bcrypt.hash('provaprova', saltRounds),
      token_residuo: 15,
      punteggio_totale: 120,
      ruolo: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Piero',
      cognome: 'Matteotti',
      email: 'piero@example.com',
      hash: await bcrypt.hash('testtest', saltRounds),
      token_residuo: 5,
      punteggio_totale: 70,
      ruolo: 'utente',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Davide',
      cognome: 'Santurbano',
      email: 'davide@example.com',
      hash: await bcrypt.hash('cracovia', saltRounds),
      token_residuo: 18,
      punteggio_totale: 160,
      ruolo: 'utente',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Giocatore', null, {});
  }
};