'use strict'
const UserDTO = require("../models/dto/user")
const GroupDTO = require("../models/dto/group")
const ItemDTO = require("../models/dto/item")
const ProductDTO = require("../models/dto/product")


module.exports = async function (fastify, opts) {

  const {order, db} = opts

  fastify.post('/api/terminal/order/change', async (request, reply)=>{
    const data = await  order.change(request.body)
    try {
      await fastify.io.emit("fullCheck", data)
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
}

