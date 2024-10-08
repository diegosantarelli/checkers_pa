const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });  // Carica il file .env

console.log('DB Config:', {
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
});

/**
 * @module DatabaseConnection
 * @description Configura e stabilisce la connessione a un database Postgres utilizzando Sequelize
 * e le variabili d'ambiente definite nel file `.env`.
 */
class DatabaseConnection {
    /**
     * @static
     * @property {Sequelize} instance - L'istanza singleton di Sequelize.
     * @description Istanza unica di Sequelize che rappresenta la connessione al database.
     */
    static instance;

    /**
     * Restituisce l'istanza singleton della connessione al database.
     *
     * @function getInstance
     * @memberof DatabaseConnection
     *
     * @returns {Sequelize} - L'istanza della connessione Sequelize.
     *
     * @description Se l'istanza non esiste ancora, viene creata e configurata utilizzando le variabili d'ambiente.
     * Altrimenti, viene restituita l'istanza esistente.
     */
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new Sequelize(
                process.env.POSTGRES_DB,
                process.env.POSTGRES_USER,
                process.env.POSTGRES_PASSWORD,
                {
                    host: process.env.POSTGRES_HOST,
                    port: Number(process.env.POSTGRES_PORT) || 5432,
                    dialect: 'postgres',
                    logging: console.log,
                }
            );
        }
        return DatabaseConnection.instance;
    }
}

// Permette di eseguire l'autenticazione solo una volta
DatabaseConnection.getInstance().authenticate()
    .then(() => {
        console.log('Connessione al database stabilita con successo.');
    })
    .catch(err => {
        console.error('Impossibile connettersi al database:', err);
    });

/**
 * Esporta l'istanza della connessione al database.
 *
 * @module DatabaseConnection
 * @returns {Sequelize} - L'istanza della connessione Sequelize.
 */
module.exports = DatabaseConnection.getInstance();
