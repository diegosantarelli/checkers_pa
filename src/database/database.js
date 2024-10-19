const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @module DatabaseConnection
 * @description Configura e stabilisce la connessione a un database Postgres utilizzando Sequelize
 * e le variabili d'ambiente definite nel file `.env`.
 */
class DatabaseConnection {
    static instance;

    /**
     * Costruttore privato simulato per prevenire istanziazioni multiple.
     * Il modificatore di visibilità non è supportato nella versione di JS corrente, utilizzabile solo in TS
     * Se viene chiamato esternamente, lancia un errore.
     */
    constructor() {
        if (DatabaseConnection.instance) {
            throw new Error("Non puoi creare un'altra istanza di DatabaseConnection. Usa DatabaseConnection.getInstance()");
        }

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

    /**
     * Restituisce l'istanza Singleton della connessione Sequelize.
     * Se l'istanza non esiste, viene creata una nuova.
     *
     * @returns {Sequelize} - L'istanza Sequelize della connessione al database.
     */
    static getInstance() {
        if (!DatabaseConnection.instance) {
            new DatabaseConnection(); // Viene creato solo una volta
        }
        return DatabaseConnection.instance;
    }
}

// Autenticazione al database
DatabaseConnection.getInstance().authenticate()
    .then(() => {
        console.log('Connessione al database stabilita con successo.');
    })
    .catch(err => {
        console.error('Impossibile connettersi al database:', err);
    });

export default DatabaseConnection;
