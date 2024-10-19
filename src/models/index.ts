import DatabaseConnection from "../database/database";
import createGiocatoreModel from './Giocatore';
import createPartitaModel from './Partita';
import createMossaModel from './Mossa';
import createMossaIAModel from './MossaIA';

/**
 * @constant {Sequelize} sequelize
 * @description Ottiene l'istanza Singleton di Sequelize dal file database.js.
 */
const sequelize = DatabaseConnection.getInstance();

/**
 * @constant {Model} Giocatore
 * @description Inizializza il modello Giocatore utilizzando l'istanza di Sequelize Singleton.
 */
const Giocatore = createGiocatoreModel(sequelize);

/**
 * @constant {Model} Partita
 * @description Inizializza il modello Partita utilizzando l'istanza di Sequelize Singleton.
 */
const Partita = createPartitaModel(sequelize);

/**
 * @constant {Model} Mossa
 * @description Inizializza il modello Mossa utilizzando l'istanza di Sequelize Singleton.
 */
const Mossa = createMossaModel(sequelize);

/**
 * @constant {Model} MossaIA
 * @description Inizializza il modello MossaIA utilizzando l'istanza di Sequelize Singleton.
 */
const MossaIA = createMossaIAModel(sequelize);

/**
 * @function associazioni
 * @description Definisce le associazioni tra i modelli Giocatore, Partita, Mossa e MossaIA.
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
if (MossaIA.associate) {
    MossaIA.associate({ Partita });
}

/**
 * @function syncModelli
 * @description Utilizzata per sincronizzare i modelli definiti nell'applicazione con le tabelle nel database PostgreSQL.
 * L'opzione `alter: true` aggiorna la struttura delle tabelle senza distruggere i dati esistenti.
 */
sequelize.sync({ alter: true })  // Usa `force: true` solo in sviluppo, poiché distrugge i dati
    .then(() => {
        console.log('Database e modelli sincronizzati con successo');
    })
    .catch((error: any) => {
        console.error('Errore durante la sincronizzazione dei modelli:', error);
    });

/**
 * @exports {Model} Giocatore, Partita, Mossa, MossaIA, sequelize
 * @description Esporta i modelli e l'istanza di Sequelize per essere utilizzati in altre parti dell'applicazione.
 */
export { Giocatore, Partita, Mossa, MossaIA, sequelize }; //export nominato
