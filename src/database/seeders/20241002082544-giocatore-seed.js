'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 12;  // Numero di cicli di hashing
    return queryInterface.bulkInsert('Giocatore', [{
      nome: 'Simone',
      cognome: 'Recinelli',
      email: 'simone@example.com',
      hash: await bcrypt.hashSync('progavanzata', saltRounds),
      token_residuo: 10,
      punteggio_totale: 100,
      ruolo: 'giocatore',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Diego',
      cognome: 'Santarelli',
      email: 'diego@example.com',
      hash: await bcrypt.hashSync('provaprova', saltRounds),
      token_residuo: 15,
      punteggio_totale: 120,
      ruolo: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Piero',
      cognome: 'Matteotti',
      email: 'piero@example.com',
      hash: await bcrypt.hashSync('testtest', saltRounds),
      token_residuo: 5,
      punteggio_totale: 70,
      ruolo: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Davide',
      cognome: 'Santurbano',
      email: 'davide@example.com',
      hash: await bcrypt.hashSync('cracovia', saltRounds),
      token_residuo: 18,
      punteggio_totale: 160,
      ruolo: 'giocatore',
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Giocatore', null, {});
  }
};
