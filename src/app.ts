import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import checkerRoutes from "./routes/checkerRoutes";

// Configurazione delle variabili d'ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT;  // Usa una variabile d'ambiente per la porta
app.use(express.json());// Middleware per analizzare il corpo delle richieste in formato JSON

/*
// Configura la connessione a PostgreSQL
const sequelize = new Sequelize(
    process.env.POSTGRES_DB!,
    process.env.POSTGRES_USER!,
    process.env.POSTGRES_PASSWORD!,
    {
        host: process.env.POSTGRES_HOST || 'db', // Usa 'db' per Docker
        port: Number(process.env.POSTGRES_PORT) || 5432,
        dialect: 'postgres',
    }
);

// Test della connessione al database
sequelize.authenticate()
    .then(() => {
        console.log('Connessione al database stabilita con successo.');
    })
    .catch(err => {
        console.error('Impossibile connettersi al database:', err);
    });

 */

// Rotta di prova
app.get('/', (req, res) => {
    res.send('Ciao, il server è attivo!');
});

// ROTTE DEL GIOCO
//app.post('/login')
app.post('/game', checkerRoutes);

//app.use(errorHandler);

// Avvio del server
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});

export default app;
