export const runtime = 'edge'
import { Redis } from '@upstash/redis'

const REDIS_KEY = 'my-key'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const value = searchParams.get('value')
  
  if (!value) {
    return new Response('No search value provided', { status: 400 })
  }

  const redis = Redis.fromEnv()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log('Starting stream write')
        controller.enqueue(encoder.encode('searching...\n'))
                
        let found = false
        while (true) {
          const items = await redis.lrange(REDIS_KEY, 0, -1)
          found = false
          for (const item of items) {
            const firstValue = Array.isArray(item) ? item[0] : item
            console.log('Checking first value:', firstValue)
            
            if (firstValue === value) {
              console.log('Found match:', firstValue)
              controller.enqueue(encoder.encode(`found: ${firstValue}\n`))
              found = true
              await new Promise(resolve => setTimeout(resolve, 1000))
              break
            }
          }
          
          if (!found) {
            controller.enqueue(encoder.encode('no match found\n'))
            break
          }
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