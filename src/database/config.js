const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @module DatabaseConfig
 * @description Configurazione delle impostazioni del database per l'ambiente di sviluppo utilizzando Sequelize e Postgres.
 *
 * @property {object} development - Configurazione dell'ambiente di sviluppo.
 * @property {string} development.username - Nome utente per la connessione al database.
 * @property {string} development.password - Password per la connessione al database.
 * @property {string} development.database - Nome del database a cui connettersi.
 * @property {string} development.host - Host del server del database.
 * @property {string|number} development.port - Porta su cui il server del database accetta connessioni.
 * @property {string} development.dialect - Dialetto del database, in questo caso "postgres".
 *
 * @example
 * // File di esempio .env:
 * POSTGRES_USER=username
 * POSTGRES_PASSWORD=password
 * POSTGRES_DB=nome_del_database
 * POSTGRES_HOST=localhost
 * POSTGRES_PORT=5432
 */
module.exports = {
    development: {
        username: process.env.POSTGRES_USER,  // Nome utente per la connessione al database.
        password: process.env.POSTGRES_PASSWORD,  // Password per la connessione al database.
        database: process.env.POSTGRES_DB,  // Nome del database.
        host: process.env.POSTGRES_HOST,  // Host del database, generalmente localhost.
        port: process.env.POSTGRES_PORT,  // Porta del database, di solito 5432 per Postgres.
        dialect: "postgres"  // Dialetto del database utilizzato da Sequelize.
    },
};