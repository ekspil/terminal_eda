const Sequelize = require("sequelize")

const Item = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    liveTime: {
        type: Sequelize.DataTypes.INTEGER,
        field: "live_time"
    },
    minCount: {
        type: Sequelize.DataTypes.INTEGER,
        field: "min_count"
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
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
module.exports = Item
