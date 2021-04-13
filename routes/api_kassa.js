'use strict'
const fs = require('fs');
const path = require('path');


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

  fastify.get('/api/eo/getImgs', async (request, reply) => {

    const files_ = [];
    let files = fs.readdirSync('public/slider');
    for (let i in files){
      let name = files[i];
        files_.push(name);

    }
    return files_;


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
    await kassa.update(request.body, request.params.orderId, request.query.printer)
    await fastify.io.emit("fullCheck", global.Orders)

    return {ok: true}
  })

  fastify.post('/api/kassa/printFiscal/', async (request, reply) => {

    const res = await kassa.printFiscal(request.body)
    const result = await res.json()
    return {ok: true, result}
  })

  fastify.post('/api/kassa/payTerminal/', async (request, reply) => {

    const res = await kassa.payTerminal(request.body)
    const result = await res.json()
    return {ok: true, result}
  })

  fastify.post('/api/kassa/setPayed/', async (request, reply) => {

    const res = await kassa.setPayed(request.body, order)
    await fastify.io.emit("fullCheck", global.Orders)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/setCanceled/', async (request, reply) => {

    const res = await kassa.setCanceled(request.body)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/xReport/', async (request, reply) => {

    const res = await kassa.xReport(request.body)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/zReport/', async (request, reply) => {

    const res = await kassa.zReport(request.body)
    await kassa.Settlement(0)
    return {ok: true, res}

  })

  fastify.post('/api/kassa/returnChekPayment/', async (request, reply) => {

    const res = await kassa.returnChekPayment(request.body)
    const result = await res.json()
    return {ok: true, result}

  })
}

