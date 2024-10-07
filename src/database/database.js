const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });  // Assicurati di caricare il file .env

console.log('DB Config:', {
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
});

/**
 * @module DatabaseConnection
 * @description Configura e stabilisce la connessione a un database Postgres utilizzando Sequelize e le variabili d'ambiente.
 *
 * @property {string} process.env.POSTGRES_DB - Nome del database a cui connettersi.
 * @property {string} process.env.POSTGRES_USER - Nome utente per l'accesso al database.
 * @property {string} process.env.POSTGRES_PASSWORD - Password per l'accesso al database.
 * @property {string} process.env.POSTGRES_HOST - Host del database (es. localhost).
 * @property {string|number} process.env.POSTGRES_PORT - Porta del database (di default 5432).
 *
 * @example
 * // Esempio di configurazione .env
 * POSTGRES_DB=database_name
 * POSTGRES_USER=user
 * POSTGRES_PASSWORD=secret
 * POSTGRES_HOST=localhost
 * POSTGRES_PORT=5432
 */

// Usa le variabili d'ambiente per configurare la connessione
const sequelize = new Sequelize(
    process.env.POSTGRES_DB,  // Nome del database
    process.env.POSTGRES_USER,  // Nome utente per il database
    process.env.POSTGRES_PASSWORD,  // Password del database
    {
        host: process.env.POSTGRES_HOST,  // Host del database
        port: process.env.POSTGRES_PORT || 5432,  // Porta del database, default 5432
        dialect: 'postgres',  // Specifica il dialetto da usare (Postgres)
        logging: console.log,  // Abilita il logging delle query SQL
    }
);

/**
 * @function sequelize.authenticate
 * @description Testa la connessione al database Postgres e stampa un messaggio di successo o un errore nel log.
 *
 * @returns {Promise<void>} - La promise si risolve con un messaggio di successo o si rigetta con un errore.
 *
 * @example
 * // Connessione riuscita:
 * Connessione al database stabilita con successo.
 *
 * @example
 * // Connessione fallita:
 * Impossibile connettersi al database: [Error message]
 */
sequelize.authenticate()
    .then(() => {
        console.log('Connessione al database stabilita con successo.');
    })
    .catch(err => {
        console.error('Impossibile connettersi al database:', err);
    });

module.exports = sequelize;