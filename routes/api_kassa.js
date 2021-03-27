'use strict'
const UserDTO = require("../models/dto/user")
const GroupDTO = require("../models/dto/group")
const ItemDTO = require("../models/dto/item")
const ProductDTO = require("../models/dto/product")


module.exports = async function (fastify, opts) {

  const {order, db, fetch, kassa} = opts


  fastify.get('/api/kassa/create', async (request, reply) => {
    return kassa.newOrder()
  })

  fastify.get('/api/kassa/getOrder/:orderId', async (request, reply) => {
    return kassa.getOrder(request.params.orderId)
  })

  fastify.get('/api/kassa/setStatus/:orderId/:status', async (request, reply) => {
     await kassa.setStatus(request.params, order)
    try {
      await fastify.io.emit("fullCheck", global.Orders)

      await fastify.io.emit("fullItems", global.Items)
      return {ok: true}
    }catch(e){
      return{ok: false}
    }
  })

  fastify.post('/api/kassa/updateOrder/:orderId', async (request, reply) => {
    await kassa.update(request.body, request.params.orderId)
    await fastify.io.emit("fullCheck", global.Orders)

    return {ok: true}
  })
}

