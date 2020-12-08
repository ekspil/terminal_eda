const Sequelize = require("sequelize")

const Product = {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: Sequelize.DataTypes.STRING,
    },
    corner: {
        type: Sequelize.DataTypes.STRING,
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
module.exports = Product
