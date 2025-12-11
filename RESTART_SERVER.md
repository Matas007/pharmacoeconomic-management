# Kaip restartuoti serverį

## Problema
Jei matote Prisma klaidą apie `adminNotes` lauką, reikia:

1. **Sustabdyti serverį** (PowerShell terminale spauskite `Ctrl + C`)

2. **Regeneruoti Prisma klientą:**
```bash
$env:DATABASE_URL="file:./dev.db"; npx prisma generate
```

3. **Paleisti serverį iš naujo:**
```bash
$env:DATABASE_URL="file:./dev.db"; $env:NEXTAUTH_URL="http://localhost:3000"; $env:NEXTAUTH_SECRET="your-secret-key-here"; npm run dev
```

## Arba paprasčiau:

1. **Ctrl + C** terminale (sustabdyti serverį)
2. **Paleisti šią komandą:**
```bash
$env:DATABASE_URL="file:./dev.db"; npx prisma generate; $env:NEXTAUTH_URL="http://localhost:3000"; $env:NEXTAUTH_SECRET="your-secret-key-here"; npm run dev
```

Sistema bus prieinama: http://localhost:3000
