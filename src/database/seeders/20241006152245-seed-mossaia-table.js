'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Ottieni tutte le partite dal database
        const partite = await queryInterface.sequelize.query(
            `SELECT id_partita, tavola FROM "Partita"`,
            {
                type: Sequelize.QueryTypes.SELECT
            }
        );

        const mosseIA = [];

        // Itera su tutte le partite per generare le mosse corrispondenti
        for (const partita of partite) {
            const board = JSON.stringify(partita.tavola); // Recupera la tavola della partita corrente

            // Aggiungi le mosse relative a questa partita
            mosseIA.push(
                {
                    numero_mossa: 1,
                    tavola: board, // Usa la tavola della partita corrente
                    pezzo: 'singolo',
                    id_partita: partita.id_partita,  // Associa alla partita corrente
                    data: new Date(),
                    from_position: 'A1',  // Esempio di posizione di partenza
                    to_position: 'B2',    // Esempio di posizione di destinazione
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    numero_mossa: 2,
                    tavola: board, // Usa la tavola della partita corrente
                    pezzo: 'dama',
                    id_partita: partita.id_partita,  // Associa alla partita corrente
                    data: new Date(),
                    from_position: 'B2',
                    to_position: 'C3',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            );
        }

        // Inserisci tutte le mosse IA nel database
        await queryInterface.bulkInsert('MossaIA', mosseIA);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('MossaIA', null, {});
    }
};