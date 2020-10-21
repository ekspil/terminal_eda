'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/root', async function (request, reply) {
    reply.status(200)
    return {}
  })
  fastify.post('/root', async function (request, reply) {
    reply.status(200)
    return {}
  })

}
