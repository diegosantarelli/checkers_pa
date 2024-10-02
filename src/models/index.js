/*
    1.	Inizializza Sequelize: Crea un’istanza di Sequelize per stabilire la connessione al database.
	2.	Importa i Modelli: Importa i vari modelli (es. Giocatore, Partita, Mossa) e li inizializza con l’istanza di Sequelize.
	3.	Gestisce le Associazioni: Imposta le relazioni tra i modelli, se presenti (ad esempio, un Giocatore può avere molte Mosse).
	4.	Esporta Modelli e Connessione: Esporta i modelli e l’istanza di Sequelize, rendendoli disponibili per l’uso in altre parti dell’applicazione (ad esempio, nei controller).
 */

import { Sequelize } from 'sequelize';
import Giocatore from './Giocatore';
import Partita from './Partita';
import Mossa from './Mossa';

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
});

// Importa i modelli
const models = {
    Giocatore: Giocatore(sequelize),
    Partita: Partita(sequelize),
    Mossa: Mossa(sequelize),
};

// Associa i modelli
Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Esporta i modelli e il sequelize instance
export { sequelize };
export default models;