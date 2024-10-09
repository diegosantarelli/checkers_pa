import { Sequelize } from 'sequelize';
import createGiocatoreModel from './Giocatore';
import createPartitaModel from './Partita';
import createMossaModel from './Mossa';
import createMossaIAModel from './MossaIA';  // Importa il modello MossaIA
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @constant sequelize
 * @description Inizializza un'istanza di Sequelize per la connessione al database PostgreSQL.
 * Le credenziali e i parametri del database vengono caricati dalle variabili d'ambiente specificate nel file .env.
 *
 * @example
 * ```typescript
 * const sequelize = new Sequelize(
 *   process.env.POSTGRES_DB!,
 *   process.env.POSTGRES_USER!,
 *   process.env.POSTGRES_PASSWORD,
 *   {
 *     host: process.env.POSTGRES_HOST,
 *     port: Number(process.env.POSTGRES_PORT) || 5432,
 *     dialect: 'postgres',
 *     logging: false,
 *   }
 * );
 * ```
 */
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

// Inizializza i modelli con l'istanza di Sequelize
/**
 * @constant Giocatore
 * @description Inizializza il modello Giocatore utilizzando l'istanza di Sequelize.
 */
const Giocatore = createGiocatoreModel(sequelize);

/**
 * @constant Partita
 * @description Inizializza il modello Partita utilizzando l'istanza di Sequelize.
 */
const Partita = createPartitaModel(sequelize);

/**
 * @constant Mossa
 * @description Inizializza il modello Mossa utilizzando l'istanza di Sequelize.
 */
const Mossa = createMossaModel(sequelize);

/**
 * @constant MossaIA
 * @description Inizializza il modello MossaIA utilizzando l'istanza di Sequelize.
 */
const MossaIA = createMossaIAModel(sequelize);  // Inizializza il modello MossaIA

// Definisce le associazioni tra i modelli, se presenti

/**
 * @function
 * @name associazioni
 * @description Definisce le associazioni tra i modelli Giocatore, Partita, Mossa, AI e MossaIA.
 */
if (Giocatore.associate) {
    Giocatore.associate({ Mossa });
}
if (Partita.associate) {
    Partita.associate({ Giocatore, Mossa });
}
if (Mossa.associate) {
    Mossa.associate({ Partita, Giocatore });
}
if (MossaIA.associate) {  // Associazioni per MossaIA
    MossaIA.associate({ Partita });
}

/**
 * @function
 * @name syncModelli
 * @description Sincronizza i modelli definiti con il database PostgreSQL.
 * L'opzione `alter: true` aggiorna la struttura delle tabelle senza distruggere i dati esistenti.
 *
 * @example
 * ```typescript
 * sequelize.sync({ alter: true })
 *   .then(() => {
 *     console.log('Database e modelli sincronizzati con successo');
 *   })
 *   .catch((error: any) => {
 *     console.error('Errore durante la sincronizzazione dei modelli:', error);
 *   });
 * ```
 */
sequelize.sync({ alter: true })  // Usa `force: true` solo in sviluppo, poiché distrugge i dati
    .then(() => {
        console.log('Database e modelli sincronizzati con successo');
    })
    .catch((error: any) => {
        console.error('Errore durante la sincronizzazione dei modelli:', error);
    });

/**
 * @exports
 * @description Esporta i modelli e l'istanza di Sequelize per essere utilizzati in altre parti dell'applicazione.
 */
export { Giocatore, Partita, Mossa, MossaIA, sequelize };