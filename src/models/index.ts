import { Sequelize } from 'sequelize';
import createGiocatoreModel from './Giocatore';
import createPartitaModel from './Partita';
import createMossaModel from './Mossa';
import createAIModel from './AI';

const sequelize = new Sequelize(/* configurazione */);

// Inizializza i modelli
const Giocatore = createGiocatoreModel(sequelize);
const Partita = createPartitaModel(sequelize);
const Mossa = createMossaModel(sequelize);
const AI = createAIModel(sequelize);

// Associazioni
Giocatore.associate({ Mossa });
Partita.associate({ Giocatore, Mossa });
Mossa.associate({ Partita, Giocatore });
AI.associate({ Partita });

// Esporta i modelli
export { Giocatore, Partita, Mossa, AI, sequelize };
