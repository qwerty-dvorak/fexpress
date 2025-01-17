'use client'

import { addToRedis } from './actions'
import { useState } from 'react'

// Utility function for writing to stream
function writeToStream(text: string, setResults: React.Dispatch<React.SetStateAction<string[]>>) {
  setResults(prev => [...prev, text])
}

export default function Home() {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResults([])
    setIsLoading(true)
    
    try {
      writeToStream('starting search...', setResults)
      const result = await addToRedis(key, value)

      console.log('Result:', result)
      
      if (result.status === 'success') {
        const response = await fetch(`/api/edge?value=${result.v1}`)
        if (!response.ok) throw new Error('Stream response not ok')
        
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (reader) {
          try {
            while (true) {
            const { done, value } = await reader.read()
              if (done) break
              const text = decoder.decode(value)
              writeToStream(text, setResults)
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            writeToStream(`Stream error: ${errorMessage}`, setResults)
          } finally {
            reader.releaseLock()
          }
        }
        
        setKey('')
        setValue('')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      writeToStream(`Error: ${errorMessage}`, setResults)
    } finally {
      setIsLoading(false)
      writeToStream('stream complete', setResults)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter key"
          className="px-4 py-2 border rounded"
          disabled={isLoading}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
          className="px-4 py-2 border rounded"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Add to Redis'}
        </button>
      </form>
      <div className="mt-4 p-4 border rounded max-h-60 overflow-auto w-full max-w-md">
        {results.map((result, index) => (
          <pre key={`${result}-${Date.now()}-${index}`} className="whitespace-pre-wrap break-words">
            {result}
          </pre>
        ))}
      </div>
    </main>
  )
}