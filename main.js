
const fastify = require('fastify')({
  logger: { prettyPrint: true }
})

const { Client } = require('undici')

function service ({ url, path, method, headers }) {
  return new Promise((resolve, reject) => {
    const client = new Client(url)
    client.request({ path, method, headers }, (err, { statusCode, body }) => {
      if (err || statusCode !== 200) {
        console.error(err, statusCode)
        reject(new Error('ERROR_SERVICE_RESPONSE'))
        return
      }
      const response = []
      body.on('data', (buffer) => {
        response.push(buffer)
      })
      body.on('end', () => {
        resolve(Buffer.concat(response).toString('utf8'))
      })
    })
  })
}

fastify.get('/content/:topic', async function (request, reply) {
  const lang = request.query.ln
  const topic = request.params.topic

  reply.header('content-type', 'text/plain')
  reply.send(await service({
    url: 'http://localhost:9001',
    path: `/cms/${topic}/${lang}`,
    method: 'GET'
  }))
})

function start () {
  fastify.listen(3000, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}

function app () {
  return fastify
}

module.exports = { start, app }
