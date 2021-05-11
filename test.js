
const t = require('tap')
const server = require('.')
const { MockAgent } = require('undici')

const fastify = server.app()

t.teardown(async () => {
  await fastify.close()
})

const mockAgent = new MockAgent({ connections: 1 })
const mockClient = mockAgent.get('http://localhost:9001')

mockClient.intercept({
  path: '/cms/pizza/it',
  method: 'GET'
}).reply(200, 'margherita')

mockClient.intercept({
  path: () => { return true },
  method: 'GET'
}).reply(200, 'not a pizza')

t.test('get content', { only: true }, async (t) => {
  const response = await fastify.inject('/content/pizza?ln=it')

  t.equal(response.body, 'margherita')
  t.equal(response.statusCode, 200)
})
