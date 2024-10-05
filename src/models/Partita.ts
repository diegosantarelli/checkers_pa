import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Definisci gli attributi di Partita
interface PartitaAttributes {
    id_partita: number;
    id_giocatore1: number;
    id_giocatore2: number | null;
    livello_IA: 'facile' | 'normale' | 'difficile' | 'estrema' | null; // Cambiato a string per il livello di IA
    stato: 'in corso' | 'completata' | 'abbandonata';
    tipo: 'Amichevole' | 'Normale' | 'Competitiva'; // Tipi validi
    tavola: string; // Aggiunta per rappresentare la configurazione della tavola
    data_inizio: Date;
}

// Definizione degli attributi opzionali durante la creazione
interface PartitaCreationAttributes extends Optional<PartitaAttributes, 'id_partita' | 'data_inizio'> {}

// Estendi la classe Model con gli attributi tipizzati
class Partita extends Model<PartitaAttributes, PartitaCreationAttributes> implements PartitaAttributes {
    public id_partita!: number;
    public id_giocatore1!: number;
    public id_giocatore2!: number | null;
    public livello_IA!: 'facile' | 'normale' | 'difficile' | 'estrema' | null;
    public stato!: 'in corso' | 'completata' | 'abbandonata';
    public tipo!: 'Amichevole' | 'Normale' | 'Competitiva'; // Tipi validi
    public tavola!: string; // Rappresentazione della tavola
    public data_inizio!: Date;

    static associate(models: any) {
        // Le associazioni sono già state fatte nel file index.ts
    }
}

// Inizializzazione del modello
export default (sequelize: Sequelize) => {
    Partita.init({
        id_partita: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_giocatore1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
        },
        id_giocatore2: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
        },
        livello_IA: {
            type: DataTypes.ENUM('facile', 'normale', 'difficile', 'estrema'), // Uso di ENUM per livello IA
            allowNull: true,
        },
        stato: {
            type: DataTypes.ENUM('in corso', 'completata', 'abbandonata'),
            allowNull: false,
            defaultValue: 'in corso',
        },
        tipo: {
            type: DataTypes.ENUM('Amichevole', 'Normale', 'Competitiva'), // Uso di ENUM per tipo
            allowNull: false,
        },
        tavola: {
            type: DataTypes.STRING, // Usa STRING o TEXT a seconda delle tue necessità
            allowNull: false,
        },
        data_inizio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Partita',
        tableName: 'Partita',
        timestamps: false,
    });

    return Partita;
};