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

  fastify.post('/api/kassa/updateOrder/:orderId', async (request, reply) => {
    await kassa.update(request.body, request.params.orderId)

    return {ok: true}
  })
}

