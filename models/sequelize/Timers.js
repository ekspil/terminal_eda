const Sequelize = require("sequelize")

const Timer = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    start: {
        type: Sequelize.DataTypes.DATE,
    },
    end: {
        type: Sequelize.DataTypes.DATE,
    },
    corner: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
    orderId: {
        type: Sequelize.DataTypes.STRING,
        field: "order_id"
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
module.exports = Timer
