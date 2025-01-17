'use client'

export default function Home() {
  async function handleClick() {
    const response = await fetch('/api/edge')
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    let result = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const decoded = decoder.decode(value, { stream: true })
      result += decoded
      console.log('Chunk received:', decoded)
    }
    console.log('[MESSAGE RECEIVED]', result)
  }

  return (
    <main>
      <button type="button" onClick={handleClick}>Start Stream</button>
    </main>
  )
}