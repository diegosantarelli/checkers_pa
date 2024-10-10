const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @module DatabaseConfig
 * @description Configurazione delle impostazioni del database per l'ambiente di sviluppo utilizzando Sequelize e Postgres.
 *
 * Le impostazioni vengono caricate dal file `.env` che contiene le variabili d'ambiente per la connessione al database.
 * Questa configurazione viene utilizzata per inizializzare la connessione al database PostgreSQL in ambiente di sviluppo.
 *
 * @property {object} development - Configurazione dell'ambiente di sviluppo.
 * @property {string} development.username - Nome utente per la connessione al database.
 * @property {string} development.password - Password per la connessione al database.
 * @property {string} development.database - Nome del database a cui connettersi.
 * @property {string} development.host - Host del server del database.
 * @property {string|number} development.port - Porta su cui il server del database accetta connessioni.
 * @property {string} development.dialect - Dialetto del database, in questo caso "postgres".
 */
module.exports = {
    development: {
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        dialect: "postgres"
    },
};
