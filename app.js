'use strict'
require("dotenv").config()
const path = require('path')
const AutoLoad = require('fastify-autoload')
const Sequelize = require("sequelize")
const fetch = require("node-fetch")
const cron = require("node-cron")

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  const sequelizeOptions = {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    ssl: false,
    logging: !!Number(process.env.SQL_LOGS)
  }
  const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, sequelizeOptions)

  const User = require("./models/sequelize/User")
  const Smena = require("./models/sequelize/Smena")
  const Product = require("./models/sequelize/Product")
  const Item = require("./models/sequelize/Item")
  const ProductGroup = require("./models/sequelize/ProductGroup")
  const Stat = require("./models/sequelize/Statistic")
  global.Orders = []
  global.Products = []
  global.Items = []
  global.K = 1



  const UserModel = sequelize.define("users", User)
  const SmenaModel = sequelize.define("smenas", Smena)
  const ProductModel = sequelize.define("products", Product)
  const ItemModel = sequelize.define("items", Item)
  const ProductGroupModel = sequelize.define("product_groups", ProductGroup)
  const StatModel = sequelize.define("statistics", Stat)

  ProductModel.belongsTo(ProductGroupModel, {
    foreignKey: "group_id",
    as: "group"
  })
  //
  // await sequelize.sync({force: true})
  // const us = [
  //   {name: "Ефремов Алексей", login: "admin@admin.ru", password: "admin", role: "ADMIN"},
  //   {name: "Шилова Екатерина", login: "user@user.ru", password: "user", role: "USER"},
  // ]
  //
  // const its = [
  //   {name: "Макароны", liveTime: 1, minCount: 1, station: 7},
  //   {name: "Бульон", liveTime: 2, minCount: 1, station: 7},
  //   {name: "Лапша", liveTime: 3, minCount: 2, station: 7},
  //   {name: "Бекон", liveTime: 4, minCount: 4, station: 7},
  //   {name: "Колбаски", liveTime: 5, minCount: 2, station: 7},
  //   {name: "Сыр", liveTime: 2, minCount: 2, station: 7},
  //   {name: "Зелень", liveTime: 1, minCount: 3, station: 7},
  //   {name: "Ушки", liveTime: 2, minCount: 2, station: 7},
  //   {name: "Перец", liveTime: 1, minCount: 3, station: 7},
  //   {name: "Соль", liveTime: 2, minCount: 3, station: 7},
  //   {name: "Огурчики", liveTime: 1, minCount: 3, station: 7},
  //   {name: "Помидорчики", liveTime: 2, minCount: 3, station: 7},
  //   {name: "Клюква", liveTime: 3, minCount: 3, station: 7},
  //   {name: "Хлеб", liveTime: 3, minCount: 3, station: 7},
  //   {name: "Вода", liveTime: 4, minCount: 3, station: 7},
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
  //   {name: "Омлет", items: [1, 2, 3, 4, 5, 6, 7, 8], station: 2},
  //   ]
  // const ss = [
  //   {plan: 1500000, amount: 0, count: 0, manager: 1},
  //   {plan: 1600000, amount: 0, count: 0, manager: 2},
  // ]
  //
  //
  // await UserModel.bulkCreate(us)
  // await ItemModel.bulkCreate(its)
  // await ProductGroupModel.bulkCreate(gs)
  // await ProductModel.bulkCreate(ps)
  // await SmenaModel.bulkCreate(ss)
  //


  const Order = require("./services/OrderService")
  const DB = require("./services/DBService")
  const Schedule = require("./services/ScheduleService")




  await fastify.register(require('@guivic/fastify-socket.io'), {path: '/io', origins: '*:*'}, (error) => console.error(error));
  // Do not touch the following lines
  fastify.io.origins('*:*')

  fastify.register(require('fastify-cors'), {
    credentials: true,
    origin: true
  })



  opts.order = new Order({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    io: fastify.io
  })

  opts.db = new DB({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    io: fastify.io
  })

  opts.fetch = fetch

  opts.schedule = new Schedule({
    UserModel,
    ItemModel,
    ProductModel,
    ProductGroupModel,
    SmenaModel,
    StatModel,
    io: fastify.io
  })

  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
  })


  // Start functions
  await opts.schedule.updateProducts()

  await opts.order.startItems()
  setInterval(()=> {
    opts.schedule.checkItemsDie()
  }, 20000)
  setInterval(()=> {
    opts.schedule.checkNeedItems()
  }, 5000)
  setInterval(()=> {
    opts.schedule.updateProducts()
  }, 300000)


  cron.schedule("*/30 * * * *", () => {
    opts.schedule.checkItemsK()
      .then(log => console.log(log))
      .catch((e) => {
        console.log("Failed to set K")
        console.log(e)
      })
  })


  //////////////////


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
