'use strict'
require("dotenv").config()
const path = require('path')
const AutoLoad = require('fastify-autoload')
const Sequelize = require("sequelize")


module.exports = async function (fastify, opts) {
  // Place here your custom code!

  const sequelizeOptions = {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    ssl: false
  }
  const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, sequelizeOptions)

  const User = require("./models/sequelize/User")
  const Product = require("./models/sequelize/Product")
  const Item = require("./models/sequelize/Item")



  const UserModel = sequelize.define("users", User)
  const ProductModel = sequelize.define("product", Product)
  const ItemModel = sequelize.define("item", Item)

  const Order = require("./services/OrderService")



  await fastify.register(require('@guivic/fastify-socket.io'), opts, (error) => console.error(error));


  opts.order = new Order({
    UserModel,
    ItemModel,
    ProductModel,
    io: fastify.io
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
