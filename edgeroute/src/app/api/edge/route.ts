export const runtime = 'edge'
import { Redis } from '@upstash/redis'

const REDIS_KEY = 'my-key'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const value = searchParams.get('value')
  
  const redis = Redis.fromEnv()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log('Starting stream write')
        controller.enqueue(encoder.encode('searching...\n'))
        
        const items = await redis.lrange(REDIS_KEY, 0, -1)
        console.log('Found items:', items)
        
        for (const item of items) {
          console.log('Writing item:', item)
          controller.enqueue(encoder.encode(`found: ${item}\n`))
          // Add small delay to prevent stream flooding
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        controller.enqueue(encoder.encode('search done\n'))
      } catch (error) {
        console.error('Stream error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        controller.enqueue(encoder.encode(`error: ${errorMessage}\n`))
      } finally {
        controller.close()
      }
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-cache',
      'connection': 'keep-alive'
    }
  })
}