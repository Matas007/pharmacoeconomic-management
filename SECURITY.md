# Saugumo dokumentacija

## Įdiegtos apsaugos priemonės

### 1. Middleware apsauga (`src/middleware.ts`)

#### ✅ Proxy Header validacija
- **X-Forwarded-For** header'io tikrinimas ir validacija
- **X-Real-IP** header'io tikrinimas
- Užtikrina realaus kliento IP nustatymą

#### ✅ Host Header validacija
- Tikrina ar `Host` header atitinka leidžiamus domenus
- Apsaugo nuo Host Header Injection atakų
- Production'e leidžiami tik `*.vercel.app` ir konfigūruoti domenai

#### ✅ CSRF apsauga
- Tikrina `Origin` ir `Referer` header'ius POST/PUT/PATCH/DELETE request'uose
- Blokuoja request'us be šių header'ių (išskyrus NextAuth)
- Validuoja, kad Origin atitinka leidžiamus domenus

#### ✅ Rate Limiting (globalinis)
- **100 request'ų per 15 minučių** vienam IP adresui
- Taikomas visiems API endpoint'ams (išskyrus `/api/auth/*`)
- Grąžina `429 Too Many Requests` su `Retry-After` header'iu
- Automatinis cache'o valymas

#### ✅ Security Headers
- `X-Frame-Options: DENY` - apsauga nuo clickjacking
- `X-Content-Type-Options: nosniff` - apsauga nuo MIME sniffing
- `X-XSS-Protection: 1; mode=block` - apsauga nuo XSS
- `Content-Security-Policy` - kontroliuoja šaltinius
- `Strict-Transport-Security` (HSTS) - tik HTTPS
- `Referrer-Policy` - riboja referer informaciją
- `Permissions-Policy` - blokuoja nereikalingas funkcijas

---

### 2. Rate Limiting Utility (`src/lib/rate-limit.ts`)

#### Funkcijos:
- `strictRateLimit()` - 10 request'ų/min
- `standardRateLimit()` - 30 request'ų/min
- `lenientRateLimit()` - 100 request'ų/5min
- `customRateLimit()` - custom konfigūracija

#### Naudojimas API route'e:
```typescript
import { strictRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-client-ip') || 'unknown'
  const rateLimit = await strictRateLimit(clientIp)
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Per daug užklausų' },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimit)
      }
    )
  }
  
  // ... likusias API logika
}
```

---

### 3. NextAuth Saugumo patobulinimai (`src/lib/auth.ts`)

#### ✅ Saugūs Cookie nustatymai
- `httpOnly: true` - negalima pasiekti per JavaScript
- `sameSite: 'lax'` - CSRF apsauga
- `secure: true` (production) - tik HTTPS
- `__Secure-` prefix production'e

#### ✅ Session konfigūracija
- JWT strategija
- 30 dienų maksimalus session laikas
- Debug režimas tik development'e

---

### 4. Vercel konfigūracija (`vercel.json`)

#### Security headers:
- Visi security header'iai taikomi globaliai
- HSTS įjungtas production'e
- Funkcijų timeout: 10s

---

### 5. Next.js konfigūracija (`next.config.js`)

#### Saugumo funkcijos:
- `poweredByHeader: false` - slepia Next.js versija
- `reactStrictMode: true` - griežtas režimas
- Security headers
- Webpack optimizacijos
- SWC minifikacija

---

## Apsaugos nuo konkrečių atakų

### ✅ IP Spoofing
**Apsauga:** Vercel automatiškai nustato teisingą `X-Forwarded-For`, middleware validuoja header'ius.

### ✅ Host Header Injection
**Apsauga:** Middleware tikrina `Host` header'į prieš leidžiamus domenus.

### ✅ CSRF (Cross-Site Request Forgery)
**Apsauga:** 
- Middleware tikrina `Origin`/`Referer` header'ius
- NextAuth cookies su `sameSite: 'lax'`

### ✅ XSS (Cross-Site Scripting)
**Apsauga:**
- `X-XSS-Protection` header'is
- `Content-Security-Policy`
- React automatinis escaping

### ✅ SQL Injection
**Apsauga:** Prisma ORM parametrizuoti queries

### ✅ Rate Limiting Bypass
**Apsauga:** 
- Globalinis rate limiting pagal IP
- Papildomas rate limiting PIN verification'ui

### ✅ Clickjacking
**Apsauga:** `X-Frame-Options: DENY`

### ✅ MIME Sniffing
**Apsauga:** `X-Content-Type-Options: nosniff`

---

## Testavimas

### Testuoti Rate Limiting:
```bash
# Siųsti 120 request'ų (turėtų blokuoti po 100)
for i in {1..120}; do
  curl -X GET https://your-app.vercel.app/api/admin/requests
  echo "Request $i"
done
```

### Testuoti CSRF apsaugą:
```bash
# Request be Origin/Referer (turėtų blokuoti)
curl -X POST https://your-app.vercel.app/api/user/requests \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test"}'
```

### Testuoti Host Header validaciją:
```bash
# Netinkamas Host (turėtų blokuoti production'e)
curl -X GET https://your-app.vercel.app/api/admin/requests \
  -H "Host: evil.com"
```

---

## Production Deployment

### Prieš deploy:
1. ✅ Patikrinti `NEXTAUTH_SECRET` env kintamąjį
2. ✅ Įsitikinti, kad `DATABASE_URL` teisingas
3. ✅ Pridėti production domenus į middleware allowed hosts
4. ✅ Patikrinti Vercel Environment Variables

### Po deploy:
1. ✅ Patikrinti Security Headers: https://securityheaders.com/
2. ✅ Testuoti Rate Limiting
3. ✅ Patikrinti SSL sertifikatą
4. ✅ Testuoti CSRF apsaugą

---

## PASTABOS Production'ui

### ⚠️ In-Memory Rate Limiting limitas
Dabartinis rate limiting naudoja in-memory cache, kuris **neveiks su multiple serverless instances**.

**Sprendimas Production'ui:**
- Naudoti **Redis** arba **Upstash Redis**
- Integruoti **Vercel KV** (serverless key-value store)

### ⚠️ Leidžiami domenai
Atnaujinkite `src/middleware.ts`:
```typescript
const allowedHosts = [
  'your-domain.com',
  'www.your-domain.com',
  'your-app.vercel.app',
]
```

---

## Kontaktai

Jei radote saugumo pažeidžiamumą, praneškite:
- Email: security@your-domain.com
- GitHub: Security Advisory

**NESKELKITE pažeidžiamumų viešai!**

