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
  const ProductGroup = require("./models/sequelize/ProductGroup")
  global.Orders = []



  const UserModel = sequelize.define("users", User)
  const ProductModel = sequelize.define("products", Product)
  const ItemModel = sequelize.define("items", Item)
  const ProductGroupModel = sequelize.define("product_groups", ProductGroup)

  ProductModel.belongsTo(ProductGroupModel, {
    foreignKey: "group_id",
    as: "group"
  })

  // await sequelize.sync({force: true})
  // const us = [
  //   {name: "Ефремов Алексей", login: "admin@admin.ru", password: "admin", role: "ADMIN"},
  //   {name: "Шилова Екатерина", login: "user@user.ru", password: "user", role: "USER"},
  // ]
  //
  // const its = [
  //   {name: "Макароны", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Бульон", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Лапша", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Бекон", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Колбаски", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Сыр", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Зелень", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Ушки", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Перец", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Соль", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Огурчики", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Помидорчики", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Клюква", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Хлеб", liveTime: 1000, minCount: 3, station: 1},
  //   {name: "Вода", liveTime: 1000, minCount: 3, station: 1},
  // ]
  //
  // const gs = [
  //   {name: "Роял"},
  //   {name: "Компот"}
  // ]
  //
  // const ps = [
  //   {name: "Суп", items: [2], station: 1, code: "СВ-92232"},
  //   {name: "Бутерброд", items: [1, 2], station: 1, code: "СВ-92231"},
  //   {name: "Омлет", items: [1, 2, 3], station: 2},
  // ]
  //
  //
  // await UserModel.bulkCreate(us)
  // await ItemModel.bulkCreate(its)
  // await ProductGroupModel.bulkCreate(gs)
  // await ProductModel.bulkCreate(ps)



  const Order = require("./services/OrderService")
  const DB = require("./services/DBService")




  opts.order = new Order({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    io: fastify.io
  })

  opts.db = new DB({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    io: fastify.io
  })

  fastify.register(require('fastify-cors'), {

    credentials: true,
    origin: true
  })

  await fastify.register(require('@guivic/fastify-socket.io'), {path: '/io'}, (error) => console.error(error));
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
