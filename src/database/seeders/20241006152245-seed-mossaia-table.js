'use strict';

const { EnglishDraughts: Draughts } = require('rapid-draughts/english');

// Funzione di conversione da posizione numerica a notazione scacchistica
const convertPositionToNotation = (position) => {
    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // Lettere per le colonne
    const row = 8 - Math.floor(position / 4); // Calcola la riga (1-8)
    const fileIndex = position % 4; // Ottieni l'indice del file basato sulla posizione
    const isOddRow = row % 2 === 1;
    const file = files[2 * fileIndex + (isOddRow ? 1 : 0)]; // Calcola la colonna corretta in base alla riga
    return `${file}${row}`;
};

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
            const draughts = Draughts.setup(); // Setup della partita per ottenere il board iniziale

            // Simula alcune mosse
            const moves = draughts.moves; // Ottieni le mosse legali disponibili
            const selectedMove1 = moves[0]; // Seleziona una mossa valida

            // Esegui la prima mossa e salva lo stato della tavola
            draughts.move(selectedMove1);
            const boardAfterMove1 = draughts.board;

            // Aggiungi le mosse relative a questa partita
            mosseIA.push(
                {
                    numero_mossa: 1,
                    tavola: JSON.stringify({ initialBoard: boardAfterMove1 }), // Salva lo stato della tavola nel formato corretto
                    pezzo: 'singolo',
                    id_partita: partita.id_partita,  // Associa alla partita corrente
                    data: new Date(),
                    from_position: convertPositionToNotation(selectedMove1.origin), // Converti l'origine
                    to_position: convertPositionToNotation(selectedMove1.destination), // Converti la destinazione
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    numero_mossa: 2,
                    tavola: JSON.stringify({ initialBoard: boardAfterMove1 }), // Salva lo stato della tavola nel formato corretto
                    pezzo: 'dama',
                    id_partita: partita.id_partita,  // Associa alla partita corrente
                    data: new Date(),
                    from_position: convertPositionToNotation(selectedMove1.origin), // Converti l'origine
                    to_position: convertPositionToNotation(selectedMove1.destination), // Converti la destinazione
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