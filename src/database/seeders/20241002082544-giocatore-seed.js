'use strict';

/**
 * Seeder per inserire dati di esempio nella tabella `Giocatore`.
 *
 * Questo seeder inserisce un insieme di giocatori con i loro dati personali,
 * credenziali di accesso (hash della password), token residui, punteggio e ruoli.
 * Le password sono memorizzate utilizzando l'algoritmo bcrypt per l'hashing sicuro.
 *
 * @param {object} queryInterface - L'interfaccia utilizzata per eseguire le query di inserimento in Sequelize.
 * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
 *
 * @function up
 * @description Inserisce i seguenti giocatori nella tabella `Giocatore`:
 * - Simone Recinelli: utente con email `simone@example.com`, 10 token residui, punteggio di 10.
 * - Diego Santarelli: admin con email `diego@example.com`, 15 token residui, punteggio di 2.
 * - Piero Matteotti: utente con email `piero@example.com`, 5 token residui, punteggio di 10.
 * - Davide Santurbano: utente con email `davide@example.com`, 1.5 token residui, punteggio di 8.
 *
 * @returns {Promise<void>} - Restituisce una promise risolta quando i dati vengono inseriti con successo.
 */


const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 12;

    return queryInterface.bulkInsert('Giocatore', [{
      nome: 'Simone',
      cognome: 'Recinelli',
      email: 'simone@example.com',
      hash: await bcrypt.hash('progavanzata', saltRounds),
      token_residuo: 10,
      punteggio_totale: 10,
      ruolo: 'utente',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Diego',
      cognome: 'Santarelli',
      email: 'diego@example.com',
      hash: await bcrypt.hash('provaprova', saltRounds),
      token_residuo: 15,
      punteggio_totale: 2,
      ruolo: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Piero',
      cognome: 'Matteotti',
      email: 'piero@example.com',
      hash: await bcrypt.hash('testtest', saltRounds),
      token_residuo: 5,
      punteggio_totale: 10,
      ruolo: 'utente',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      nome: 'Davide',
      cognome: 'Santurbano',
      email: 'davide@example.com',
      hash: await bcrypt.hash('cracovia', saltRounds),
      token_residuo: 1.5,
      punteggio_totale: 8,
      ruolo: 'utente',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  /**
   * @function down
   * @description Cancella un set di dati dalla tabella `Giocatore`. Poiché la condizione specifica per la cancellazione
   * è fissata su un id che non esiste (`id_giocatore: 999`), non rimuove alcun record durante la fase di rollback.
   *
   * @param queryInterface
   * @param Sequelize
   * @returns {Promise<void>} - Restituisce una promise risolta quando i dati vengono cancellati con successo.
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Giocatore', { id_giocatore: 999 });
  }
};