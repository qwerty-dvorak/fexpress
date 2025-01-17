export const runtime = 'edge'

export async function GET() {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  // Example: Write chunks with delays
  const message = "Hello, world."
  let isFirst = true
  for (const chunk of encoder.encode(message)) {
    await writer.ready
    if (!isFirst) {
      await new Promise(resolve => setTimeout(resolve, 500)) 
    }
    await writer.write(chunk)
    isFirst = false
  }
  await writer.ready
  await writer.close()

  return new Response(readable, {
    headers: { 'content-type': 'text/plain' }
  })
}