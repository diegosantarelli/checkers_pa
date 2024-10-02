'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('AI', [
      {
        difficolta: 'Facile',    // Difficoltà facile
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        difficolta: 'Normale',   // Difficoltà normale
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        difficolta: 'Difficile',  // Difficoltà difficile
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        difficolta: 'Estrema',    // Difficoltà estrema
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AI', null, {});
  }
};

