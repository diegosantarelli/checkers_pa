const { Sequelize } = require('sequelize');

// Configura la connessione a PostgreSQL nel container Docker
const sequelize = new Sequelize('checkers_game', 'postgres', 'avanzata', {
    host: process.env.POSTGRES_HOST, // Usa il nome del servizio definito nel docker-compose
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
});

// Test della connessione
sequelize.authenticate()
    .then(() => {
        console.log('Connessione al database stabilita con successo.');
    })
    .catch(err => {
        console.error('Impossibile connettersi al database:', err);
    });

module.exports = sequelize;