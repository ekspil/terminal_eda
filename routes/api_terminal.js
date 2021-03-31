'use strict'
const UserDTO = require("../models/dto/user")
const GroupDTO = require("../models/dto/group")
const ItemDTO = require("../models/dto/item")
const ProductDTO = require("../models/dto/product")


module.exports = async function (fastify, opts) {

  const {order, db, fetch} = opts


  fastify.get('/api/terminal/ext/new', async (request, reply) => {
    if(request.query.key !== process.env.KEY) return {ok: false, error: 403, text: "INVALID KEY"}
    const result = await fetch('https://terminaleda.ru/common_api/order/'+request.query.order_id+'?apikey='+process.env.API_KEY, {
      method: "GET"
    })
    const json = await result.json()
    const data = await order.change(json, "superdostavka")
    await fastify.io.emit("fullCheck", data)

    await fastify.io.emit("fullItems", global.Items)
    return {ok: true}
  })

  fastify.get('/api/terminal/ext/update', async (request, reply) => {

    if(request.query.key !== process.env.KEY) return {ok: false, error: 403, text: "INVALID KEY"}
    const result = await fetch('https://terminaleda.ru/common_api/order/'+request.query.order_id+'?apikey='+process.env.API_KEY, {
      method: "GET"
    })

    const json = await result.json()
    const data = await order.change(json, "superdostavka_upd")
    await fastify.io.emit("fullCheck", data)

    await fastify.io.emit("fullItems", global.Items)
    return {ok: true}
  })

  fastify.post('/api/terminal/order/change', async (request, reply)=>{
    const data = await  order.change(request.body)

    try {
      await fastify.io.emit("fullCheck", data)
      
      await fastify.io.emit("fullItems", global.Items)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }


  })
  fastify.post('/api/terminal/order/changeHidden', async (request, reply)=>{
    order.changeHidden(request.body)
    await fastify.io.emit("fullCheck", global.Orders)
    return {ok: true}


  })

  fastify.post('/api/terminal/order/sendStatus', async (request, reply)=>{

    //accepted, production, cooked, sent, done, canceled(отменен)
    let {orderId, status, corner} = request.body
    let Id = orderId
    if(orderId.includes("-")){
      Id = (orderId.split("-"))[1]
    }


    try {

    const result = await fetch(`https://terminaleda.ru/common_api/order/${Id}?apikey=${process.env.API_KEY}`, {
      method: "GET"
    })
    const json = await result.json()

    if(json.status === 'done' || json.status === 'canceled' ){
      return {ok: true, comment: "Статус не отправлен, заказ уже завершен или отменен"}
    }

    if(status.toLowerCase() === "done" && corner) {
      const checkDone = order.checkDone(orderId, corner)
      if(!checkDone) {
        await fastify.io.emit("fullCheck", global.Orders)
        return {ok: true, comment: "Статус не отправлен, еще есть не завершенные корнеры"}
      }
    }


      await fetch(`https://terminaleda.ru/common_api/set_order_status/${Id}/${status}?apikey=${process.env.API_KEY}`, {
        method: "GET"
      })
      await fastify.io.emit("fullCheck", global.Orders)
      return {ok: true, comment: "Статус отправлен: " + status}
    }
    catch (e) {
      await fastify.io.emit("fullCheck", global.Orders)
      return {ok: false, comment: "Походу нет связи с супердоставкой...", error: e}
    }
  })

  fastify.post('/api/terminal/order/setReadyItem', async (request, reply)=>{

    try {
      const data = await  order.setReadyItem(request.body)
      await fastify.io.emit("fullItems", data)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }


  })

  fastify.post('/api/terminal/order/setOrderScreen', async (request, reply)=>{

    try {
      order.setOrderScreen(request.body)
      await fastify.io.emit("fullCheck", global.Orders)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }


  })

  fastify.post('/api/terminal/order/setDieItem', async (request, reply)=>{

    try {
      const data = await  order.setDieItem(request.body)
      await fastify.io.emit("fullItems", data)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }


  })
  fastify.get('/api/terminal/order/all', async (request, reply)=>{
    try {
      await fastify.io.emit("fullCheck", Orders)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }


  })
  fastify.get('/api/terminal/order/allItems', async (request, reply)=>{
    try {
      await fastify.io.emit("fullItems", Items)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }


  })

  fastify.post('/api/terminal/users/auth', async (request, reply)=>{
    const user = await db.auth(request.body)
    if(!user){
      return null
    }
    return new UserDTO(user)
  })

  fastify.get('/api/terminal/users/get', async (request, reply) => {
    const users = await db.getAllUsers()
    return users.map(key => new UserDTO(key))
  })
  fastify.post('/api/terminal/users/save', async (request, reply) => {
    const user = await db.saveUser(request.body)
    return new UserDTO(user)
  })
  fastify.get('/api/terminal/products/get', async (request, reply) => {
    const products = await db.getAllProducts()
    return products.map(key => new ProductDTO(key))
  })
  fastify.post('/api/terminal/products/save', async (request, reply) => {
    const product = await db.saveProduct(request.body)
    return new ProductDTO(product)
  })
  fastify.get('/api/terminal/groups/get', async (request, reply) => {
    const groups = await db.getAllGroups()
    return groups.map(key => new GroupDTO(key))
  })
  fastify.get('/api/terminal/items/get', async (request, reply) => {
    const items = await db.getAllItems()
    return items.map(key => new ItemDTO(key))
  })
  fastify.post('/api/terminal/items/save', async (request, reply) => {
    const item = await db.saveItem(request.body)
    return new ItemDTO(item)
  })
  fastify.get('/api/terminal/smena/get', async (request, reply) => {
    return await db.getLastSmena()
  })
  fastify.post('/api/terminal/smena/save', async (request, reply) => {
    return await db.saveSmena(request.body)
  })
  fastify.post('/api/terminal/groups/save', async (request, reply) => {
    return await db.saveGroup(request.body)
  })
}

