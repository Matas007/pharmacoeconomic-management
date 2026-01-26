import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (paprastai naudotumėte Redis production'e)
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minučių
const MAX_REQUESTS_PER_WINDOW = 100 // 100 request'ų per 15 min

export function middleware(request: NextRequest) {
  // ====================
  // 1. PROXY HEADER VALIDACIJA
  // ====================
  
  // Vercel automatiškai nustato teisingą IP per x-forwarded-for
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  // Gauti realų client IP (Vercel užtikrina, kad tai būtų tikras IP)
  const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
  
  // ====================
  // 2. HOST HEADER VALIDACIJA
  // ====================
  
  const host = request.headers.get('host')
  const allowedHosts = [
    'localhost:3000',
    'localhost:3001',
    // Pridėkite savo production domenus
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
  ].filter(Boolean)
  
  // Production'e tikrinti host header'į
  if (process.env.NODE_ENV === 'production' && host) {
    const isAllowedHost = allowedHosts.some(allowedHost => 
      allowedHost && (host === allowedHost || host.endsWith('.vercel.app'))
    )
    
    if (!isAllowedHost && !host.includes('localhost')) {
      console.warn(`⚠️ Invalid Host header: ${host}`)
      return NextResponse.json(
        { error: 'Netinkamas Host header' },
        { status: 400 }
      )
    }
  }
  
  // ====================
  // 3. CSRF APSAUGA (Origin/Referer tikrinimas)
  // ====================
  
  // POST, PUT, PATCH, DELETE request'ams tikrinti Origin/Referer
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Jei nėra nei Origin, nei Referer - galimai CSRF ataka
    if (!origin && !referer) {
      // Išimtis: NextAuth callback'ai (jie gali neturėti Origin)
      if (!request.nextUrl.pathname.startsWith('/api/auth/')) {
        console.warn(`⚠️ CSRF: Missing Origin/Referer for ${request.method} ${request.nextUrl.pathname}`)
        return NextResponse.json(
          { error: 'Trūksta Origin arba Referer header' },
          { status: 403 }
        )
      }
    }
    
    // Jei yra Origin, patikrinti ar jis atitinka allowed hosts
    if (origin && process.env.NODE_ENV === 'production') {
      try {
        const originUrl = new URL(origin)
        const isAllowedOrigin = allowedHosts.some(allowedHost => 
          allowedHost && (
            originUrl.host === allowedHost || 
            originUrl.host.endsWith('.vercel.app')
          )
        )
        
        if (!isAllowedOrigin && !originUrl.host.includes('localhost')) {
          console.warn(`⚠️ CSRF: Invalid Origin ${origin}`)
          return NextResponse.json(
            { error: 'Netinkamas Origin' },
            { status: 403 }
          )
        }
      } catch (e) {
        console.error('Origin parsing error:', e)
      }
    }
  }
  
  // ====================
  // 4. RATE LIMITING (pagal IP)
  // ====================
  
  // Taikoma tik API route'ams
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now()
    const rateLimitKey = `${clientIp}:${request.nextUrl.pathname}`
    
    // Išimtis: NextAuth endpoint'ai (jie turi savo rate limiting)
    if (!request.nextUrl.pathname.startsWith('/api/auth/')) {
      let entry = rateLimitStore.get(rateLimitKey)
      
      // Jei įrašo nėra arba window pasibaigė - sukurti naują
      if (!entry || now > entry.resetAt) {
        entry = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
        rateLimitStore.set(rateLimitKey, entry)
      } else {
        // Tikrinti ar neviršytas limitas
        if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
          const remainingSeconds = Math.ceil((entry.resetAt - now) / 1000)
          console.warn(`⚠️ Rate limit exceeded for IP ${clientIp} on ${request.nextUrl.pathname}`)
          
          return NextResponse.json(
            { 
              error: 'Per daug užklausų',
              message: `Pabandykite vėliau po ${Math.ceil(remainingSeconds / 60)} min.`,
              retryAfter: remainingSeconds
            },
            { 
              status: 429,
              headers: {
                'Retry-After': remainingSeconds.toString(),
                'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': entry.resetAt.toString()
              }
            }
          )
        }
        
        // Padidinti counter'į
        entry.count++
        rateLimitStore.set(rateLimitKey, entry)
      }
    }
    
    // Valyti senus įrašus (kas 1000 request'ų)
    if (rateLimitStore.size > 1000) {
      const entries = Array.from(rateLimitStore.entries())
      entries.forEach(([key, value]) => {
        if (now > value.resetAt) {
          rateLimitStore.delete(key)
        }
      })
    }
  }
  
  // ====================
  // 5. SECURITY HEADERS
  // ====================
  
  const response = NextResponse.next()
  
  // Pridėti client IP prie response header'ių (galite naudoti API route'uose)
  response.headers.set('X-Client-IP', clientIp)
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Content Security Policy (CSP)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js reikia unsafe-eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app",
    "frame-ancestors 'none'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Strict Transport Security (HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

// Taikyti visoms API ir page route'ams
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

