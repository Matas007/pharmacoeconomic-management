# 🚀 Supabase integracijos vadovas

## Žingsnis 1: Sukurti Supabase projektą

### 1.1. Eikite į Supabase
1. Atidarykite: https://supabase.com
2. Spauskite **"Start your project"** arba **"Sign in"**
3. Prisijunkite su GitHub arba el. paštu

### 1.2. Sukurkite naują projektą
1. Spauskite **"New Project"**
2. Pasirinkite organizaciją arba sukurkite naują
3. Įveskite projekto informaciją:
   - **Name**: `pharmacoeconomic-system` (arba bet kokį pavadinimą)
   - **Database Password**: Sugeneruokite stiprų slaptažodį (IŠSAUGOKITE JĮ!)
   - **Region**: Pasirinkite artimiausią (pvz., `Europe (Frankfurt)`)
   - **Pricing Plan**: Free (užtenka testavimui)
4. Spauskite **"Create new project"**
5. Palaukite 1-2 minutes kol projektas bus sukurtas

### 1.3. Gaukite Connection String
1. Eikite į projekto **Settings** (apatinėje kairiojoje)
2. Pasirinkite **Database**
3. Scroll žemyn iki **Connection string**
4. Pasirinkite **URI** tab
5. Nukopijuokite URI ir pakeiskite `[YOUR-PASSWORD]` į savo slaptažodį

**Connection string atrodys taip:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxx.supabase.co:5432/postgres
```

**Pavyzdys su slaptažodžiu:**
```
postgresql://postgres:MySecretPassword123@db.abcdefgh.supabase.co:5432/postgres
```

---

## Žingsnis 2: Savo kompiuteryje

Dabar paleiskite šią komandą PowerShell:

```powershell
echo "READY_FOR_STEP_2"
```

**Sustokite čia ir parašykite man:** "Padariau žingsnį 1, turiu connection string"

Ir aš tęsiu toliau! 😊

---

## Kas bus daroma toliau (automatiškai):

✅ Atnaujinsiu Prisma schemą naudoti PostgreSQL  
✅ Sukursiu .env.local failą su tavo credentials  
✅ Migruosiu duomenų bazę į Supabase  
✅ Sukursiu vartotojus Supabase duomenų bazėje  
✅ Paleisiu serverį su nauja konfigūracija  

---

## 📝 Pastabos:

- **Išsaugokite** Supabase projekto slaptažodį!
- **Nepublikuokite** connection string (jis privatus!)
- Free Supabase planas turi:
  - 500 MB duomenų bazės vietos
  - 1 GB pralaidumo per mėnesį
  - 50,000 aktyvių vartotojų per mėnesį
  - Šio projekto tai bus daugiau nei pakanka! ✅

---

## 🆘 Pagalba:

Jei kyla problemų su Supabase projekto sukūrimu, rašykite man ir aš padėsiu! 🙂

