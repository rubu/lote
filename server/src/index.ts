import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { fastify } from 'fastify'
import FastifyStaticPlugin from '@fastify/static'
import { join } from 'path'
import { createRequire } from 'module'
import { mkdtemp, mkdir, readFile } from 'fs/promises'
import { createWriteStream, mkdirSync } from 'fs'
import { pipeline } from 'stream/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const require = createRequire(import.meta.url)
const { transcribe, getNapiVersion, testCppException } = require(join(import.meta.dirname, '..', 'bin', 'lote'))
const conversationsPath = join(import.meta.dirname, '..', 'conversations')
mkdirSync(conversationsPath, { recursive: true })

try {
    testCppException();
} catch (error) {
    if (!(error instanceof Error && error.message === 'This is a test cpp exception')) {
        throw error;
    }
}
console.info(`NAPI version: ${getNapiVersion()}`)

const server: FastifyInstance = fastify()

server.register(FastifyStaticPlugin, {
    root: process.env.WWW_ROOT || join(import.meta.dirname, '..', '..', 'client', 'dist'),
    prefix: '/',
})

server.addContentTypeParser(/^audio\/.*/, async function (request: FastifyRequest, payload: any) {
    return payload
})

function getFileExtension(mimeType: string) {
    if (mimeType.startsWith('audio/webm')) {
        return 'webm'
    }
    throw new Error(`unsupported mime type ${mimeType}`)
}

server.post('/api/transcribe', async (request: FastifyRequest, reply: FastifyReply) => {
    const conversationPath = await mkdtemp(join(conversationsPath, 'conversation_'))
    await mkdir(conversationPath, { recursive: true })
    const contentType = request.headers['content-type']
    if (!contentType) {
        throw new Error('content type not found')
    }
    const uploadPath = join(conversationPath, `audio.${getFileExtension(contentType)}`)
    await pipeline(request.raw, createWriteStream(uploadPath))
    const audioPath = join(conversationPath, 'audio.pcm')
    await execAsync(`ffmpeg -i ${uploadPath}  -f f32le -ac 1 -ar 16000 ${audioPath}`)
    const audioBytes = await readFile(audioPath)
    let result =  await transcribe(join(import.meta.dirname, '..', 'models', 'whisper-large-v3-lv-late-cv19.bin'), audioBytes)
    return result;
})

server.listen({ port: 3000 }, (err: Error | null, address: string) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`server is running on ${address}`)
})
