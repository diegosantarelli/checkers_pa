import { Sequelize } from 'sequelize';
import createGiocatoreModel from './Giocatore';
import createPartitaModel from './Partita';
import createMossaModel from './Mossa';
import createAIModel from './AI';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Inizializza Sequelize con la configurazione del database
const sequelize = new Sequelize(
    process.env.POSTGRES_DB!,
    process.env.POSTGRES_USER!,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT) || 5432,
        dialect: 'postgres',  // Assicurati di includere il dialect
    }
);

// Inizializza i modelli
const Giocatore = createGiocatoreModel(sequelize);
const Partita = createPartitaModel(sequelize);
const Mossa = createMossaModel(sequelize);
const AI = createAIModel(sequelize);

// Associazioni tra i modelli
Giocatore.associate({ Mossa });
Partita.associate({ Giocatore, Mossa });
Mossa.associate({ Partita, Giocatore });
AI.associate({ Partita });

// Sincronizza i modelli con il database (facoltativo, a seconda del flusso di lavoro)
sequelize.sync({ alter: true })  // Usa `force: true` solo in sviluppo, poiché distrugge i dati
    .then(() => {
        console.log('Database e modelli sincronizzati con successo');
    })
    .catch((error: any) => {
        console.error('Errore durante la sincronizzazione dei modelli:', error);
    });

// Esporta i modelli e l'istanza di Sequelize
export { Giocatore, Partita, Mossa, AI, sequelize };