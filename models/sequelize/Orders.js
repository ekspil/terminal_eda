const Sequelize = require("sequelize")

const Order = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    route: {
        type: Sequelize.DataTypes.INTEGER,
    },
    type: {

        type: Sequelize.DataTypes.STRING,
    },
    status: {
        type: Sequelize.DataTypes.STRING,
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
module.exports = Order
