const Sequelize = require("sequelize")

const OrderItem = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    item_id: {
        type: Sequelize.DataTypes.INTEGER
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: Sequelize.DataTypes.STRING,
    },
    changed: {
        type: Sequelize.DataTypes.BOOLEAN,
    },
    corner: {
        type: Sequelize.DataTypes.STRING,
    },
    count: {
        type: Sequelize.DataTypes.INTEGER,
    },
    price: {
        type: Sequelize.DataTypes.FLOAT,
    },
    items: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    station: {
        type: Sequelize.DataTypes.INTEGER,
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
module.exports = OrderItem
