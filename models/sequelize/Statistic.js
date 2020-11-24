const Sequelize = require("sequelize")

const Stat = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    item_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
    },
    item_name: {
        type: Sequelize.DataTypes.STRING,
    },
    hour: {
        type: Sequelize.DataTypes.INTEGER
    },
    count: {
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
module.exports = Stat
