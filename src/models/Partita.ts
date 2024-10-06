import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import Mossa from './Mossa';  // Usa il default import per Mossa

// Definisci gli attributi di Partita
interface PartitaAttributes {
    id_partita: number;
    id_giocatore1: number;
    id_giocatore2: number | null;
    livello_IA: 'facile' | 'normale' | 'difficile' | 'estrema' | null;
    stato: 'in corso' | 'completata' | 'abbandonata';
    tipo: 'Amichevole' | 'Normale' | 'Competitiva';
    tavola: any;
    data_inizio: Date;
    id_vincitore: number | null;
}

// Definizione degli attributi opzionali durante la creazione
interface PartitaCreationAttributes extends Optional<PartitaAttributes, 'id_partita' | 'data_inizio' | 'id_vincitore'> {}

// Estendi la classe Model con gli attributi tipizzati
class Partita extends Model<PartitaAttributes, PartitaCreationAttributes> implements PartitaAttributes {
    public id_partita!: number;
    public id_giocatore1!: number;
    public id_giocatore2!: number | null;
    public livello_IA!: 'facile' | 'normale' | 'difficile' | 'estrema' | null;
    public stato!: 'in corso' | 'completata' | 'abbandonata';
    public tipo!: 'Amichevole' | 'Normale' | 'Competitiva';
    public tavola!: any;
    public data_inizio!: Date;
    public id_vincitore!: number | null;

    static associate(models: any) {
        // Associazione tra Partita e Mossa
        Partita.hasMany(models.Mossa, { foreignKey: 'id_partita', as: 'mosse' });
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
            type: DataTypes.ENUM('facile', 'normale', 'difficile', 'estrema'),
            allowNull: true,
        },
        stato: {
            type: DataTypes.ENUM('in corso', 'completata', 'abbandonata'),
            allowNull: false,
            defaultValue: 'in corso',
        },
        tipo: {
            type: DataTypes.ENUM('Amichevole', 'Normale', 'Competitiva'),
            allowNull: false,
        },
        tavola: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        data_inizio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        id_vincitore: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Giocatore',
                key: 'id_giocatore',
            },
        },
    }, {
        sequelize,
        modelName: 'Partita',
        tableName: 'Partita',
        timestamps: false,
    });

    return Partita;
};
