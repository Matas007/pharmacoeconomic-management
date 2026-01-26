/**
 * Rate Limiting utility
 * 
 * Šis failas skirtas papildomam rate limiting funkcionalumui API route'uose.
 * Pagrindinis rate limiting yra middleware.ts, bet čia galite pridėti specifinę logiką.
 */

interface RateLimitConfig {
  interval: number // Laikotarpis milisekundėmis
  uniqueTokenPerInterval: number // Maksimalus request'ų skaičius per interval
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * In-memory rate limiter
 * PASTABA: Production'e naudokite Redis arba kitą distributed cache
 */
class RateLimiter {
  private cache: Map<string, { count: number; resetAt: number }>

  constructor() {
    this.cache = new Map()
  }

  /**
   * Patikrinti ar request'as neviršija limito
   */
  async check(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const key = identifier
    let entry = this.cache.get(key)

    // Jei įrašo nėra arba laikotarpis pasibaigė
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 1,
        resetAt: now + config.interval
      }
      this.cache.set(key, entry)

      return {
        success: true,
        limit: config.uniqueTokenPerInterval,
        remaining: config.uniqueTokenPerInterval - 1,
        reset: entry.resetAt
      }
    }

    // Jei viršytas limitas
    if (entry.count >= config.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: config.uniqueTokenPerInterval,
        remaining: 0,
        reset: entry.resetAt
      }
    }

    // Padidinti counter'į
    entry.count++
    this.cache.set(key, entry)

    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - entry.count,
      reset: entry.resetAt
    }
  }

  /**
   * Išvalyti senus įrašus
   */
  cleanup() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    entries.forEach(([key, value]) => {
      if (now > value.resetAt) {
        this.cache.delete(key)
      }
    })
  }

  /**
   * Gauti cache'o dydį
   */
  get size() {
    return this.cache.size
  }

  /**
   * Išvalyti visą cache'ą
   */
  clear() {
    this.cache.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Valyti kas 10 minučių
if (typeof window === 'undefined') {
  setInterval(() => {
    if (rateLimiter.size > 10000) {
      rateLimiter.cleanup()
    }
  }, 10 * 60 * 1000)
}

// ====================
// PRESETS
// ====================

/**
 * Strict rate limit - 10 request'ų per minutę
 */
export async function strictRateLimit(identifier: string): Promise<RateLimitResult> {
  return rateLimiter.check(identifier, {
    interval: 60 * 1000, // 1 minutė
    uniqueTokenPerInterval: 10
  })
}

/**
 * Standard rate limit - 30 request'ų per minutę
 */
export async function standardRateLimit(identifier: string): Promise<RateLimitResult> {
  return rateLimiter.check(identifier, {
    interval: 60 * 1000, // 1 minutė
    uniqueTokenPerInterval: 30
  })
}

/**
 * Lenient rate limit - 100 request'ų per 5 minutes
 */
export async function lenientRateLimit(identifier: string): Promise<RateLimitResult> {
  return rateLimiter.check(identifier, {
    interval: 5 * 60 * 1000, // 5 minutės
    uniqueTokenPerInterval: 100
  })
}

/**
 * Custom rate limit
 */
export async function customRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  return rateLimiter.check(identifier, config)
}

/**
 * Helper funkcija gauti rate limit header'ius
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }
}

export default rateLimiter

