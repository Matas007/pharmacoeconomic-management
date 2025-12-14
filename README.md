# Farmakoekonominio modeliavimo valdymo sistema

Sistema farmakoekonominio modeliavimo užklausų valdymui su vartotojų ir administratorių funkcijomis.

## ✨ Funkcijos

### Vartotojams:
- ✅ Registracija ir prisijungimas
- ✅ Užklausų siuntimas su filtrais
- ✅ Savo užklausų statuso stebėjimas
- ✅ Farmakoekonominio modeliavimo parametrų nustatymas
- ✅ Admin pastabų peržiūra
- ✅ **NAUJA:** Kokybės vertinimo sistema (10 metrikų)
- ✅ **NAUJA:** Patirties įvertinimas nuo 1 iki 10
- ✅ **NAUJA:** In-app chat su Admin (PIN apsaugotas)
- ✅ **NAUJA:** 📱 **Pilna mobilioji optimizacija**

### Administratoriams (Darbuotojas):
- ✅ Kanban lenta užklausų valdymui su Drag & Drop
- ✅ Užklausų statuso keitimas (vilkimas kortelių)
- ✅ Statistikos peržiūra
- ✅ Visų užklausų valdymas
- ✅ Išsami užklausos peržiūra
- ✅ Pastabų rašymas vartotojams
- ✅ **NAUJA:** In-app chat su Vartotojais (PIN apsaugotas)
- ✅ **NAUJA:** Darbuotojų chat (su IT ir Kokybės vertintoju)
- ✅ **NAUJA:** 📱 **Mobile-optimized Kanban board**

### Kokybės vertintojui (Darbuotojas):
- ✅ Visų atsiliepimų peržiūra
- ✅ Statistikos analizė pagal 10 metrikų
- ✅ Vidutinių įvertinimų skaičiavimas
- ✅ Vartotojų komentarų peržiūra
- ✅ Kokybės rodiklių stebėjimas
- ✅ **NAUJA:** IT specialistų užduočių peržiūra (read-only)
- ✅ **NAUJA:** Gantt grafiko vizualizacija su progresu
- ✅ **NAUJA:** Mini dalių (subtasks) stebėjimas
- ✅ **NAUJA:** Užduočių statistika (laukiančios, vykdomos, užbaigtos)
- ✅ **NAUJA:** Darbuotojų chat (su Admin ir IT specialistu)

### IT Specialistui (Darbuotojas):
- ✅ **NAUJA:** Užduočių kūrimas ir valdymas
- ✅ **NAUJA:** Gantt grafikas vizualizacijai
- ✅ **NAUJA:** Užduočių statusų keitimas (TODO, IN_PROGRESS, DONE)
- ✅ **NAUJA:** Prioritetų nustatymas
- ✅ **NAUJA:** **Subtask sistema - užduočių skaidymas į mini dalis**
- ✅ **NAUJA:** **Automatinis progress skaičiavimas pagal subtask'us**
- ✅ **NAUJA:** Checkbox'ai mini dalių pažymėjimui
- ✅ **NAUJA:** Spalvinis kodavimas užduotims
- ✅ **NAUJA:** Laiko linijos valdymas (startDate, endDate)
- ✅ **NAUJA:** Darbuotojų chat (su Admin ir Kokybės vertintoju)

## 🛠️ Technologijos

- **Next.js 14** - React framework
- **TypeScript** - Tipų saugumas
- **Tailwind CSS** - Stilių sistema (su mobile-first dizainu)
- **NextAuth.js** - Autentifikacija
- **Prisma** - ORM duomenų bazei
- **PostgreSQL (Supabase)** - Cloud duomenų bazė
- **React Beautiful DnD** - Drag & Drop funkcionalumas
- **Lucide React** - Ikonos
- **📱 Mobile Optimized** - Pilnas responsive dizainas

## 📦 Instaliacija

### 1. Instaliuokite priklausomybes:
```bash
npm install
```

### 2. Sukurkite `.env.local` failą:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

### 3. Inicializuokite duomenų bazę:
```bash
# PowerShell (Windows)
$env:DATABASE_URL="file:./dev.db"; npx prisma generate
$env:DATABASE_URL="file:./dev.db"; npx prisma db push
```

### 4. Sukurkite sistemos vartotojus:
```bash
# PowerShell (Windows)
$env:DATABASE_URL="file:./dev.db"; node scripts/create-admin.js
```

**Prisijungimo duomenys:**

**Darbuotojai:**
1. **Admin:**
   - El. paštas: `admin@example.com`
   - Slaptažodis: `admin123`

2. **Kokybės vertintojas:**
   - El. paštas: `quality@example.com`
   - Slaptažodis: `quality123`

3. **IT Specialistas:**
   - El. paštas: `it@example.com`
   - Slaptažodis: `it123`

**Vartotojas:**
- El. paštas: `user@example.com`
- Slaptažodis: `user123`

### 5. Paleiskite sistemą:
```bash
# PowerShell (Windows)
$env:DATABASE_URL="file:./dev.db"; $env:NEXTAUTH_URL="http://localhost:3000"; $env:NEXTAUTH_SECRET="your-secret-key-here"; npm run dev
```

Sistema bus prieinama adresu: **http://localhost:3000**

## 🚀 Naudojimas

### Vartotojų registracija
1. Eikite į http://localhost:3000/auth/signup
2. Užpildykite registracijos formą
3. Prisijunkite su sukurtomis duomenimis

### Užklausos siuntimas (Vartotojas)
1. Prisijunkite kaip vartotojas
2. Dashboard: `/user/dashboard`
3. Spauskite "Nauja užklausa"
4. Užpildykite užklausos duomenis:
   - Pavadinimas
   - Aprašymas
   - Prioritetas
5. Pasirinkite farmakoekonominio modeliavimo filtrus:
   - Tikslinė populiacija
   - Intervencija
   - Palyginimas
   - Rezultatai
   - Laiko horizontas
   - Perspektyva
   - Diskonto norma
6. Siųskite užklausą
7. Stebėkite užklausos statusą ir admin pastabas

### Admin valdymas
1. Prisijunkite kaip admin: `admin@example.com` / `admin123`
2. Dashboard: `/admin/dashboard`
3. Matote:
   - Statistikas (iš viso, laukiantys, vykdomi, užbaigti)
   - Kanban lentą su 4 stulpeliais:
     - Laukiantys
     - Vykdomi
     - Užbaigti
     - Atmesti
4. **Vilkite korteles** tarp stulpelių, kad keistumėte statusą
5. **Spauskite "Peržiūrėti"** ant kortelės, kad:
   - Matytumėte visą informaciją
   - Peržiūrėtumėte filtrus
   - Parašytumėte pastabas vartotojui

### Kokybės vertinimas (Vartotojas)
1. Prisijunkite kaip vartotojas
2. Po 5 sekundžių pasirodys pranešimas įvertinti patirtį
3. Įvertinkite 10 metrikų nuo 1 iki 10:
   - 🎯 Paprastumas naudotis
   - ⚡ Greitis
   - 🎨 Spalvų paletė
   - ✍️ Šrifto stilius
   - 👓 Šrifto skaitomumas
   - 💡 Turinio aiškumas
   - 📚 Turinio kiekis
   - 🗣️ Tonas
   - 🔒 Patikimumas
   - 💬 Komunikacija
4. Palikite papildomą komentarą (nebūtina)
5. Pateikite atsiliepimą

### Kokybės vertintojo valdymas
1. Prisijunkite kaip kokybės vertintojas: `quality@example.com` / `quality123`
2. Dashboard: `/quality-evaluator/dashboard`
3. **Atsiliepimų statistika:**
   - Bendrą atsiliepimų skaičių
   - Vidutinį įvertinimą
   - Geriausią rodiklį
   - Atsiliepimų su komentarais skaičių
4. Peržiūrėkite vidurkius pagal kiekvieną metriką
5. **IT Užduočių stebėjimas (NAUJAS):**
   - Matote visų IT specialistų užduotis
   - Gantt grafikas su timeline vizualizacija
   - Užduočių statistika (iš viso, laukiančios, vykdomos, užbaigtos)
   - Subtask'ų peržiūra su progress skaičiavimu
   - **Tik peržiūra** - negalite redaguoti ar trinti
6. Skaitykite detalinius atsiliepimus su:
   - Vartotojo informacija
   - Visais įvertinimais
   - Komentarais

### IT Specialisto valdymas (NAUJAS)
1. Prisijunkite kaip IT specialistas: `it@example.com` / `it123`
2. Dashboard: `/it-specialist/dashboard`
3. Matote:
   - Statistikos kortelės (Iš viso, Laukiančios, Vykdomos, Užbaigtos)
   - **Gantt grafiką** su vizualizacija
   - Užduočių sąrašą su mini dalimis
4. **Sukurkite naują užduotį:**
   - Spauskite "Nauja užduotis"
   - Įveskite pavadinimą *
   - Aprašymą (optional)
   - Statusą (TODO/IN_PROGRESS/DONE)
   - Prioritetą (LOW/MEDIUM/HIGH/URGENT)
   - Pradžios ir pabaigos datas *
   - Pasirinkite spalvą grafikui
5. **Mini dalys (Subtasks) - NAUJAS:**
   - Po užduoties sukūrimo galite ją redaguoti
   - Pridėti mini dalis (subtasks)
   - Pažymėti mini dalis kaip užbaigtas ✓
   - **Progress skaičiuojamas automatiškai:** (užbaigtos mini dalys / visos mini dalys) × 100
   - Ištrinti mini dalis
   - Įveskite pavadinimą ir spauskite Enter arba "+"
6. **Gantt grafikas rodo:**
   - Timeline su datomis
   - Užduotis su spalvomis
   - **Automatiškai apskaičiuotą progress procentą**
   - Interaktyvus (click = edit)
7. **Užduočių sąrašas:**
   - Progress bar vizualizacija (automatinis)
   - Mini dalių sąrašą su checkbox'ais
   - Mini dalių counter (užbaigta/iš viso)
   - Redagavimo mygtukas
   - Ištrynimo mygtukas
   - Statusų ir prioritetų žymos

### Chat funkcionalumas (NAUJAS) 💬
1. **Chat mygtukas:**
   - Dešinėje pusėje apačioje matomas mėlynas chat mygtukas
   - Veikia visuose dashboard'uose
2. **Chat room'ai:**
   - **Darbuotojų chat** - ADMIN, IT_SPECIALIST, QUALITY_EVALUATOR
   - **Admin-Vartotojo chat** - ADMIN ir USER
3. **PIN apsauga:**
   - Kiekvienas room turi 4 skaitmenų PIN kodą
   - **Darbuotojų chat PIN:** `1234`
   - **Admin-Vartotojo chat PIN:** `5678`
4. **Rate limiting:**
   - 3 bandymai įvesti teisingą PIN
   - Po 3 neteisingų bandymų - 10 minučių blokavimas
   - Laikas rodomas minutėmis
5. **Chat'as:**
   - Real-time žinučių gavimas (kas 3 sekundes)
   - Žinutės su siuntėjo vardu ir role
   - Savos žinutės mėlynos, kitų - pilkos
   - Automatinis slinkimas į naujausią žinutę

## 📊 Duomenų bazės schema

### User
- `id` - Unikalus ID
- `email` - El. paštas (unikalus)
- `password` - Užšifruotas slaptažodis
- `name` - Vardas
- `role` - Rolė (USER/ADMIN/QUALITY_EVALUATOR)
- `createdAt` - Sukūrimo data
- `updatedAt` - Atnaujinimo data
- `requests` - Santykis su užklausomis
- `feedbacks` - Santykis su atsiliepimais

### Request
- `id` - Unikalus ID
- `title` - Pavadinimas
- `description` - Aprašymas
- `status` - Statusas (PENDING, IN_PROGRESS, COMPLETED, REJECTED)
- `priority` - Prioritetas (LOW, MEDIUM, HIGH, URGENT)
- `filters` - JSON filtrai
- `adminNotes` - Admin pastabos
- `createdAt` - Sukūrimo data
- `updatedAt` - Atnaujinimo data
- `userId` - Vartotojo ID

### Feedback
- `id` - Unikalus ID
- `easeOfUse` - Paprastumas naudotis (1-10)
- `speed` - Greitis (1-10)
- `colorPalette` - Spalvų paletė (1-10)
- `fontStyle` - Šrifto stilius (1-10)
- `fontReadability` - Šrifto skaitomumas (1-10)
- `contentClarity` - Turinio aiškumas (1-10)
- `contentAmount` - Turinio kiekis (1-10)
- `tone` - Tonas (1-10)
- `reliability` - Patikimumas (1-10)
- `communication` - Komunikacija (1-10)
- `comment` - Papildomas komentaras
- `createdAt` - Sukūrimo data
- `updatedAt` - Atnaujinimo data
- `userId` - Vartotojo ID

### Task (NAUJAS)
- `id` - Unikalus ID
- `title` - Pavadinimas
- `description` - Aprašymas
- `status` - Statusas (TODO, IN_PROGRESS, DONE)
- `priority` - Prioritetas (LOW, MEDIUM, HIGH, URGENT)
- `startDate` - Pradžios data
- `endDate` - Pabaigos data
- `progress` - Progress (0-100) - **Skaičiuojamas automatiškai iš subtask'ų**
- `color` - Spalva Gantt grafike
- `createdAt` - Sukūrimo data
- `updatedAt` - Atnaujinimo data
- `userId` - IT specialisto ID
- `subtasks` - Mini dalys (Subtask[])

### Subtask (NAUJAS)
- `id` - Unikalus ID
- `title` - Pavadinimas
- `completed` - Ar užbaigta (boolean)
- `order` - Tvarka sąraše
- `createdAt` - Sukūrimo data
- `updatedAt` - Atnaujinimo data
- `taskId` - Užduoties ID

### ChatRoom (NAUJAS) 💬
- `id` - Unikalus ID
- `name` - Pavadinimas ("Darbuotojų chat" / "Admin-Vartotojo chat")
- `type` - Tipas ("EMPLOYEE" / "ADMIN_USER")
- `pin` - 4 skaitmenų PIN kodas
- `createdAt` - Sukūrimo data
- `updatedAt` - Atnaujinimo data
- `messages` - Žinutės (ChatMessage[])
- `accesses` - Prieigos įrašai (ChatAccess[])

### ChatMessage (NAUJAS) 💬
- `id` - Unikalus ID
- `content` - Žinutės turinys
- `createdAt` - Sukūrimo data
- `userId` - Siuntėjo ID
- `roomId` - Chat room ID

### ChatAccess (NAUJAS) 💬
- `id` - Unikalus ID
- `attempts` - Bandymų skaičius (0-3)
- `blockedUntil` - Blokavimo pabaigos laikas
- `lastAttemptAt` - Paskutinio bandymo laikas
- `createdAt` - Sukūrimo data
- `updatedAt` - Atnaujinimo data
- `userId` - Vartotojo ID
- `roomId` - Chat room ID

## 🔌 API maršrutai

### Autentifikacija
- `POST /api/auth/register` - Vartotojo registracija
- `POST /api/auth/[...nextauth]` - NextAuth prisijungimas

### Vartotojas
- `GET /api/user/requests` - Vartotojo užklausos
- `POST /api/user/requests` - Naujos užklausos siuntimas

### Admin
- `GET /api/admin/requests` - Visos užklausos
- `GET /api/admin/requests/[id]` - Viena užklausa
- `PATCH /api/admin/requests/status` - Statuso keitimas
- `PATCH /api/admin/requests/notes` - Pastabų atnaujinimas

### Feedback (NAUJAS)
- `GET /api/feedback` - Vartotojo atsiliepimas
- `POST /api/feedback` - Sukurti atsiliepimą

### Quality Evaluator
- `GET /api/quality-evaluator/feedbacks` - Visi atsiliepimai su statistika
- `GET /api/quality-evaluator/tasks` - IT specialistų užduotys (read-only)

### IT Specialist (NAUJAS)
- `GET /api/it-specialist/tasks` - IT specialisto užduotys (su subtask'ais)
- `POST /api/it-specialist/tasks` - Sukurti naują užduotį
- `PATCH /api/it-specialist/tasks/[id]` - Atnaujinti užduotį
- `DELETE /api/it-specialist/tasks/[id]` - Ištrinti užduotį

### Subtask (NAUJAS)
- `POST /api/it-specialist/tasks/[id]/subtasks` - Sukurti mini dalį
- `PATCH /api/it-specialist/subtasks/[id]` - Pažymėti mini dalį kaip užbaigtą/atnaujinti
- `DELETE /api/it-specialist/subtasks/[id]` - Ištrinti mini dalį

### Chat (NAUJAS) 💬
- `GET /api/chat/rooms` - Gauti chat room'us pagal vartotojo rolę
- `POST /api/chat/verify-pin` - Patikrinti PIN kodą su rate limiting
- `GET /api/chat/messages?roomId={id}` - Gauti chat žinutes
- `POST /api/chat/messages` - Siųsti chat žinutę

## 🎨 Puslapiai

### Vieši
- `/` - Pagrindinis puslapis
- `/auth/signin` - Prisijungimas
- `/auth/signup` - Registracija

### Vartotojas
- `/user/dashboard` - Vartotojo dashboard
- `/user/new-request` - Naujos užklausos forma

### Admin
- `/admin/dashboard` - Admin dashboard su Kanban
- `/admin/request/[id]` - Išsami užklausos peržiūra

### Quality Evaluator
- `/quality-evaluator/dashboard` - Kokybės vertintojo dashboard su atsiliepimais

### IT Specialist (NAUJAS)
- `/it-specialist/dashboard` - IT specialisto dashboard su Gantt grafiku

## 🔧 Problemos ir sprendimai

### PowerShell execution policy klaida
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Drag & Drop neveikia
- Sistema automatiškai tikrina ar komponentas mounted
- Patikrinkite ar naršyklė palaiko drag & drop

### Prisma klaidos
- Patikrinkite ar `DATABASE_URL` nustatyta
- Paleiskite `npx prisma generate` dar kartą

### 📱 Mobilioji optimizacija
Sistema pilnai optimizuota mobiliesiems įrenginiams:
- Responsive dizainas nuo 320px iki 1920px+
- Touch-friendly mygtukai (≥44px)
- Mobile-first Tailwind klasės
- PWA ready architektūra
- Žiūrėkite `MOBILE_OPTIMIZATION.md` daugiau informacijos

## 📱 Mobilaus Naudojimo Gidas

### Rekomendacijos:
- **Telefonai (< 640px):** Visiškai palaikoma, optimizuotas single-column layout
- **Planšetės (640-1024px):** 2-kolonų layouts, touch gestures
- **Desktop (> 1024px):** Pilnas funkcionalumas su 4-kolonų Kanban

### Touch Gestures:
- **Kanban:** Vilkite korteles pirštais tarp kolonų
- **Chat:** Bottom sheet telefonuose, centered modal planšetėse
- **Forms:** Large touch targets, optimized keyboard

### Performance:
- First paint < 1.8s
- Smooth scrolling
- Optimized animations
- No layout shifts

## 📝 Licencija

MIT
