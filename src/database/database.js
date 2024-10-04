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

// Usa le variabili d'ambiente per configurare la connessione
const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: console.log,  // Abilita il logging delle query SQL
    }
);

// Test della connessione
sequelize.authenticate()
    .then(() => {
        console.log('Connessione al database stabilita con successo.');
    })
    .catch(err => {
        console.error('Impossibile connettersi al database:', err);
    });

module.exports = sequelize;