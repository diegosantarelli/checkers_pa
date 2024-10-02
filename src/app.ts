import express from 'express';
import gameRoutes from './routes/gameRoutes';
import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

// Configurazione delle variabili d'ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT;  // Usa una variabile d'ambiente per la porta

// Configura la connessione a PostgreSQL
const sequelize = new Sequelize(process.env.POSTGRES_DB!, process.env.POSTGRES_USER!, process.env.POSTGRES_PASSWORD!, {
    host: process.env.POSTGRES_HOST, // Usa il nome del servizio 'db' per Docker
    port: Number(process.env.POSTGRES_PORT),
    dialect: 'postgres',
});

// Test della connessione al database
sequelize.authenticate()
    .then(() => {
        console.log('Connessione al database stabilita con successo.');
    })
    .catch(err => {
        console.error('Impossibile connettersi al database:', err);
    });

// Middleware per analizzare il corpo delle richieste in formato JSON
app.use(express.json());

// Rotta di prova
app.get('/', (req, res) => {
    res.send('Ciao, il server è attivo!');
});

// Collega le rotte
app.use('/api', gameRoutes);

// Avvio del server
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
