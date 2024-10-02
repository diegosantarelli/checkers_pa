'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 12;  // Numero di cicli di hashing
    const hashSimone = await bcrypt.hash('progavanzata', saltRounds);
    const hashDiego = await bcrypt.hash('provaprova', saltRounds);
    const hashPiero = await bcrypt.hash('testtest', saltRounds);
    const hashDavide = await bcrypt.hash('cracovia', saltRounds);

    return queryInterface.bulkInsert('Giocatore', [{
      nome: 'Simone',
      cognome: 'Recinelli',
      email: 'simone@example.com',
      hash: hashSimone,
      token_residuo: 10,
      punteggio_totale: 100,
      ruolo: 'giocatore',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Diego',
      cognome: 'Santarelli',
      email: 'diego@example.com',
      hash: hashDiego,
      token_residuo: 15,
      punteggio_totale: 120,
      ruolo: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Piero',
      cognome: 'Matteotti',
      email: 'piero@example.com',
      hash: hashPiero,
      token_residuo: 5,
      punteggio_totale: 70,
      ruolo: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Davide',
      cognome: 'Santurbano',
      email: 'davide@example.com',
      hash: hashDavide,
      token_residuo: 18,
      punteggio_totale: 160,
      ruolo: 'giocatore',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Giocatore', null, {});
  }
};