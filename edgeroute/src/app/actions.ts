'use server'

import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()
const REDIS_KEY = 'my-key'

export async function addToRedis(v1: string, v2: string) {
  try {
    await redis.rpush(REDIS_KEY, JSON.stringify([v1, v2]))
    console.log(`Added [${v1}, ${v2}] to Redis`)
    return { status: 'success', v1 }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { status: 'error', message: errorMessage }
  }
}