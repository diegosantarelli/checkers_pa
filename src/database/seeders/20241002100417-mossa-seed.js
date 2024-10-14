'use strict';
const { EnglishDraughts: Draughts } = require('rapid-draughts/english');

/**
 * Funzione che converte una posizione numerica della scacchiera in notazione scacchistica.
 *
 * @param {number} position - La posizione numerica sulla scacchiera (0-31) in cui i pezzi possono trovarsi.
 * @returns {string} - La notazione scacchistica della posizione, nel formato "ColonnaRiga" (es. "A1").
 */
const convertPositionToNotation = (position) => {
    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // Lettere per le colonne
    const row = 8 - Math.floor(position / 4); // Calcola la riga (1-8)
    const fileIndex = position % 4; // Ottieni l'indice del file basato sulla posizione
    const isOddRow = row % 2 === 1;
    const file = files[2 * fileIndex + (isOddRow ? 1 : 0)]; // Calcola la colonna corretta in base alla riga
    return `${file}${row}`;
};

module.exports = {

    /**
     * Seeder per generare mosse simulate per le partite esistenti.
     *
     * Questo seeder estrae tutte le partite dal database e per ciascuna simula due mosse usando la libreria `rapid-draughts`.
     * Le mosse vengono inserite nella tabella `Mossa` con dettagli sulla tavola di gioco prima e dopo le mosse.
     *
     * @param {object} queryInterface - L'interfaccia utilizzata per eseguire le query di inserimento in Sequelize.
     * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
     * @returns {Promise<void>} - Restituisce una promise risolta quando i dati delle mosse vengono inseriti con successo.
     */
    async up(queryInterface, Sequelize) {
        const partite = await queryInterface.sequelize.query(
            `SELECT id_partita, tavola FROM "Partita"`,
            {
                type: Sequelize.QueryTypes.SELECT
            }
        );

        const mosse = [];

        for (const partita of partite) {
            const draughts = Draughts.setup(); // Setup della partita per ottenere il board iniziale

            // Simulazione delle mosse
            const moves = draughts.moves; // Ottenimento delle mosse legali disponibili
            const selectedMove1 = moves[0]; // Selezione di una mossa valida

            // Esecuzione della prima mossa e aggiornamento dello stato della tavola
            draughts.move(selectedMove1);
            const boardAfterMove1 = draughts.board;

            // Aggiunta della prima mossa al database
            mosse.push({
                numero_mossa: 1,
                tavola: JSON.stringify({ initialBoard: boardAfterMove1 }),
                id_partita: partita.id_partita,
                id_giocatore: 1,
                data: new Date(),
                pezzo: 'singolo',
                from_position: convertPositionToNotation(selectedMove1.origin),
                to_position: convertPositionToNotation(selectedMove1.destination),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const movesAfterMove1 = draughts.moves;
            const selectedMove2 = movesAfterMove1[0];

            draughts.move(selectedMove2);
            const boardAfterMove2 = draughts.board;

            mosse.push({
                numero_mossa: 2,
                tavola: JSON.stringify({ initialBoard: boardAfterMove2 }),
                id_partita: partita.id_partita,
                id_giocatore: 2,
                data: new Date(),
                pezzo: 'singolo',
                from_position: convertPositionToNotation(selectedMove2.origin),
                to_position: convertPositionToNotation(selectedMove2.destination),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        await queryInterface.bulkInsert('Mossa', mosse);
    },

    /**
     * Funzione per eseguire il rollback delle mosse inserite.
     *
     * Cancella tutte le mosse inserite durante la fase `up` dalla tabella `Mossa`.
     *
     * @param {object} queryInterface - L'interfaccia utilizzata per eseguire le query di cancellazione in Sequelize.
     * @param {object} Sequelize - Il modulo Sequelize che fornisce i tipi di dati e funzioni utilizzati.
     * @returns {Promise<void>} - Restituisce una promise risolta quando le mosse vengono cancellate con successo.
     */
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Mossa', null, {});
    }
};