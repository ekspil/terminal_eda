'use strict'


module.exports = async function (fastify, opts) {

  const {order} = opts

  fastify.post('/api/terminal/order/:id', order.change)
}

