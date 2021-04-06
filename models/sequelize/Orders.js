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
    sum: {
        type: Sequelize.DataTypes.FLOAT,
    },
    type: {

        type: Sequelize.DataTypes.STRING,
    },
    status: {
        type: Sequelize.DataTypes.STRING,
    },
    payType: {
        type: Sequelize.DataTypes.STRING,
        field: "pay_type"
    },
    RRNCode: {
        type: Sequelize.DataTypes.STRING,
        field: "rrn_code"
    },
    AuthorizationCode: {
        type: Sequelize.DataTypes.STRING,
        field: "auth_code"
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
