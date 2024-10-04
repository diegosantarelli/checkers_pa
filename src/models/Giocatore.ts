import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Definisci gli attributi di Giocatore
interface GiocatoreAttributes {
    id_giocatore?: number;
    nome: string;
    cognome: string;
    email: string;
    hash: string;
    token_residuo: number;
    punteggio_totale: number;
    ruolo: 'utente' | 'admin';
}

// Definisci gli attributi opzionali per l'inizializzazione
interface GiocatoreCreationAttributes extends Optional<GiocatoreAttributes, 'id_giocatore'> {}

// Definisci la classe Giocatore
class Giocatore extends Model<GiocatoreAttributes, GiocatoreCreationAttributes> implements GiocatoreAttributes {
    public id_giocatore!: number;
    public nome!: string;
    public cognome!: string;
    public email!: string;
    public hash!: string;
    public token_residuo!: number;
    public punteggio_totale!: number;
    public ruolo!: 'utente' | 'admin';

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Funzione per sottrarre i token all'avvio della partita
    public sottraiToken(quantita: number): boolean {
        if (this.token_residuo >= quantita) {
            this.token_residuo -= quantita;
            return true;
        }
        return false;
    }

    static associate(models: any) {
        // Associazioni con il modello Mossa
        Giocatore.hasMany(models.Mossa, {
            foreignKey: 'id_giocatore',
            as: 'mosse',
        });
    }
}

// Inizializzazione del modello Giocatore
export default (sequelize: Sequelize) => {
    Giocatore.init({
        id_giocatore: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cognome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token_residuo: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.45,
        },
        punteggio_totale: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        ruolo: {
            type: DataTypes.ENUM('utente', 'admin'),
            allowNull: false,
            defaultValue: 'utente',
        },
    }, {
        sequelize,
        modelName: 'Giocatore',
        tableName: 'Giocatore',
        timestamps: true,
    });

    return Giocatore;
};