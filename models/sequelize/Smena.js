const Sequelize = require("sequelize")

const Smena = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    plan: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false,
    },
    amount: {
        type: Sequelize.DataTypes.DECIMAL,
    },
    count: {
        type: Sequelize.DataTypes.INTEGER
    },
    manager: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        unique: false,
        field: "created_at"
    },
    updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        unique: false,
        field: "updated_at"
    }
}
module.exports = Smena
