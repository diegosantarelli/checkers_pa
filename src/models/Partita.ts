import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Definisci gli attributi di Partita
interface PartitaAttributes {
    id_giocatore1: number;
    id_giocatore2: number | null;
    livello_IA: number | null;  // Modificato per accettare numeri o null
    stato: 'in corso' | 'completata' | 'abbandonata';
    data_inizio: Date;
}

// Definizione degli attributi opzionali durante la creazione
interface PartitaCreationAttributes extends Optional<PartitaAttributes, 'data_inizio'> {}

// Estendi la classe Model con gli attributi tipizzati
class Partita extends Model<PartitaAttributes, PartitaCreationAttributes> implements PartitaAttributes {
    public id_giocatore1!: number;
    public id_giocatore2!: number | null;
    public livello_IA!: number | null;  // Cambiato in numero o null
    public stato!: 'in corso' | 'completata' | 'abbandonata';
    public data_inizio!: Date;

    static associate(models: any) {
        Partita.belongsTo(models.Giocatore, {
            foreignKey: 'id_giocatore1',
            as: 'giocatore1',
        });
        Partita.belongsTo(models.Giocatore, {
            foreignKey: 'id_giocatore2',
            as: 'giocatore2',
        });
        Partita.hasMany(models.Mossa, {
            foreignKey: 'id_partita',
            as: 'mosse',
        });
    }
}

// Inizializzazione del modello
export default (sequelize: Sequelize) => {
    Partita.init({
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
            type: DataTypes.INTEGER,  // Cambiato a INTEGER per accettare numeri
            allowNull: true,
        },
        stato: {
            type: DataTypes.ENUM('in corso', 'completata', 'abbandonata'),
            allowNull: false,
            defaultValue: 'in corso',
        },
        data_inizio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Partita',
        tableName: 'partite',  // Specifica il nome della tabella se necessario
        timestamps: false,  // Imposta su true se usi createdAt/updatedAt
    });

    return Partita;
};