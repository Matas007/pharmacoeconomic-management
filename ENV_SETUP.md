# Environment Variables Setup

## Reikalingi kintamieji

### Development (.env.local)
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generuokite-su: openssl rand -base64 32"
NODE_ENV="development"
```

## Production Deployment Instrukcijos

### 1. Supabase (PostgreSQL Database)
1. Eikite į https://supabase.com/dashboard
2. Sukurkite naują projektą arba naudokite esamą
3. Settings → Database → Connection String
4. Nukopijuokite "URI" connection string
```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

### 2. NextAuth Secret
Generuokite naują secret:
```bash
openssl rand -base64 32
```
Arba naudokite: https://generate-secret.vercel.app/32

```bash
NEXTAUTH_SECRET="jūsų-sugeneruotas-64-simbolių-secret"
```

### 3. NextAuth URL (Production)
```bash
# Vercel deployment:
NEXTAUTH_URL="https://jūsų-app.vercel.app"

# Custom domain:
NEXTAUTH_URL="https://jūsų-domenas.com"
```

## Vercel Environment Variables Setup

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Pridėkite šiuos kintamuosius:
   - `DATABASE_URL` (Production, Preview, Development)
   - `NEXTAUTH_SECRET` (Production, Preview, Development)
   - `NEXTAUTH_URL` (Production: https://jūsų-app.vercel.app)

## Saugumo Patarimai

⚠️ **SVARBU:**
- NIEKADA necommitinkite `.env` failo į Git!
- Naudokite skirtingus `NEXTAUTH_SECRET` development ir production!
- `DATABASE_URL` turi būti PostgreSQL (ne SQLite) production'e
- Įsitikinkite, kad `NEXTAUTH_URL` atitinka jūsų production domeną

## Middleware Konfigūracija

Atnaujinkite leidžiamus domenus `src/middleware.ts`:
```typescript
const allowedHosts = [
  'localhost:3000',
  'jūsų-domenas.com',
  'www.jūsų-domenas.com',
  'jūsų-app.vercel.app',
]
```

