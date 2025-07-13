import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { fastify } from 'fastify'
import FastifyStaticPlugin from '@fastify/static'
import { join } from 'path'

const server: FastifyInstance = fastify()

server.register(FastifyStaticPlugin, {
    root: process.env.WWW_ROOT || join(import.meta.dirname, '..', '..', 'client', 'dist'),
    prefix: '/',
})

server.get('/api/v1/transcribe', async (request: FastifyRequest, reply: FastifyReply) => {
    return { hello: 'world' }
})

server.listen({ port: 3000 }, (err: Error | null, address: string) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`server is running on ${address}`)
})
