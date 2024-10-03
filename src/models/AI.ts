import { Model, DataTypes, Sequelize } from 'sequelize';

interface AIAttributes {
    id_ai?: number;
    difficolta: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class AI extends Model<AIAttributes> implements AIAttributes {
    public id_ai!: number;
    public difficolta!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static associate(models: any) {
        // Associazioni con il modello Partita
        AI.hasMany(models.Partita, {
            foreignKey: 'id_ai',
            as: 'partite',
        });
    }
}

export default (sequelize: Sequelize) => {
    AI.init({
        id_ai: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        difficolta: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'AI',
        tableName: 'AI',
        timestamps: true, // Questo assicura che createdAt e updatedAt siano gestiti automaticamente
    });

    return AI;
};
