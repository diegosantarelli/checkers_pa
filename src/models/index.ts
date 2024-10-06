import { Sequelize } from 'sequelize';
import createGiocatoreModel from './Giocatore';
import createPartitaModel from './Partita';
import createMossaModel from './Mossa';
import createAIModel from './AI';
import createMossaIAModel from './MossaIA';  // Importa il modello MossaIA
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
        dialect: 'postgres',
        logging: false, // Disabilita il logging SQL in produzione se non necessario
    }
);

// Inizializza i modelli
const Giocatore = createGiocatoreModel(sequelize);
const Partita = createPartitaModel(sequelize);
const Mossa = createMossaModel(sequelize);
const AI = createAIModel(sequelize);
const MossaIA = createMossaIAModel(sequelize);  // Inizializza il modello MossaIA

// Associazioni tra i modelli
if (Giocatore.associate) {
    Giocatore.associate({ Mossa });
}
if (Partita.associate) {
    Partita.associate({ Giocatore, Mossa });
}
if (Mossa.associate) {
    Mossa.associate({ Partita, Giocatore });
}
if (AI.associate) {
    AI.associate({ Partita });
}
if (MossaIA.associate) {  // Associazioni per MossaIA
    MossaIA.associate({ Partita });
}

// Sincronizza i modelli con il database
sequelize.sync({ alter: true })  // Usa `force: true` solo in sviluppo, poiché distrugge i dati
    .then(() => {
        console.log('Database e modelli sincronizzati con successo');
    })
    .catch((error: any) => {
        console.error('Errore durante la sincronizzazione dei modelli:', error);
    });

// Esporta i modelli e l'istanza di Sequelize
export { Giocatore, Partita, Mossa, MossaIA, AI, sequelize };