export const runtime = 'edge'

import { Redis } from '@upstash/redis'

const REDIS_KEY = 'my-key'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const value = searchParams.get('value')
  
  const redis = Redis.fromEnv()
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  try {
    console.log('Starting stream write')
    await writer.write(encoder.encode('searching...\n'))
    
    const items = await redis.lrange(REDIS_KEY, 0, -1)
    console.log('Found items:', items)
    
    for (const item of items) {
      console.log('Writing item:', item)
      await writer.write(encoder.encode(`found: ${item}\n`))
      // Add small delay to prevent stream flooding
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    await writer.write(encoder.encode('search done\n'))
  } catch (error) {
    console.error('Stream error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await writer.write(encoder.encode(`error: ${errorMessage}\n`))
  } finally {
    await writer.close()
  }

  return new Response(stream.readable, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-cache',
      'connection': 'keep-alive'
    }
  })
}