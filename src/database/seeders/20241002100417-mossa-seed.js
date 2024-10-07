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

        const mosse = [];

        // Itera su tutte le partite per generare le mosse corrispondenti
        for (const partita of partite) {
            const board = JSON.stringify(partita.tavola); // Serializza la tavola della partita corrente

            // Aggiungi le mosse relative a questa partita
            mosse.push(
                {
                    numero_mossa: 1,
                    tavola: board, // Usa la tavola serializzata della partita corrente
                    id_partita: partita.id_partita,
                    id_giocatore: 1, // Giocatore 1
                    data: new Date(),
                    pezzo: 'singolo',
                    cattura: false,
                    promozione: false,
                    from_position: 'A1',  // Esempio di posizione di partenza
                    to_position: 'B2',    // Esempio di posizione di destinazione
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    numero_mossa: 2,
                    tavola: board, // Usa la tavola serializzata della partita corrente
                    id_partita: partita.id_partita,
                    id_giocatore: 2, // Giocatore 2
                    data: new Date(),
                    pezzo: 'singolo',
                    cattura: true,
                    promozione: false,
                    from_position: 'B2',
                    to_position: 'C3',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    numero_mossa: 3,
                    tavola: board, // Usa la tavola serializzata della partita corrente
                    id_partita: partita.id_partita,
                    id_giocatore: 1,
                    data: new Date(),
                    pezzo: 'dama',
                    cattura: false,
                    promozione: true,
                    from_position: 'C3',
                    to_position: 'D4',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    numero_mossa: 4,
                    tavola: board, // Usa la tavola serializzata della partita corrente
                    id_partita: partita.id_partita,
                    id_giocatore: 2,
                    data: new Date(),
                    pezzo: 'dama',
                    cattura: false,
                    promozione: false,
                    from_position: 'D4',
                    to_position: 'E5',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            );
        }

        // Inserisci tutte le mosse nel database
        await queryInterface.bulkInsert('Mossa', mosse);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Mossa', null, {});
    }
};