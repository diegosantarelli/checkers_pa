import { Model, DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    class Mossa extends Model {
        id_mossa!: number;
        numero_mossa!: number;
        tavola!: object;
        pezzo!: string | null;
        id_partita!: number;
        id_giocatore!: number;
        from_position!: string; // Nuova colonna per la posizione di origine
        to_position!: string;   // Nuova colonna per la posizione di destinazione
        data!: Date;

        static associate(models: any) {
            Mossa.belongsTo(models.Partita, {
                foreignKey: 'id_partita',
                as: 'partita',
            });

            Mossa.belongsTo(models.Giocatore, {
                foreignKey: 'id_giocatore',
                as: 'giocatore',
                constraints: false,
            });
        }
    }

    Mossa.init({
        id_mossa: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        numero_mossa: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tavola: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        pezzo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        id_partita: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Partita',
                key: 'id_partita',
            },
            onDelete: 'CASCADE',
        },
        id_giocatore: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        from_position: {
            type: DataTypes.STRING,  // Registra la posizione di origine
            allowNull: false,
        },
        to_position: {
            type: DataTypes.STRING,  // Registra la posizione di destinazione
            allowNull: false,
        },
        data: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Mossa',
        tableName: 'Mossa',
        timestamps: true,
    });

    return Mossa;
};