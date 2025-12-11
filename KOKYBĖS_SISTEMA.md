# 🌟 Kokybės vertinimo sistema

## Apžvalga

Sistema skirta vartotojų patirties kokybei vertinti pagal 10 metrikų. Yra 3 rolės:
- **USER** (Vartotojas) - gali įvertinti sistemą
- **ADMIN** (Administratorius) - valdyti užklausas
- **QUALITY_EVALUATOR** (Kokybės vertintojas) - analizuoti atsiliepimus

## 🚀 Paleidimo instrukcijos

### 1. Atnaujinkite duomenų bazę
```bash
# PowerShell (Windows)
$env:DATABASE_URL="file:./dev.db"; npx prisma generate
$env:DATABASE_URL="file:./dev.db"; npx prisma db push
```

### 2. Sukurkite vartotojus
```bash
$env:DATABASE_URL="file:./dev.db"; node scripts/create-admin.js
```

Tai sukurs 3 vartotojus:
- **admin@example.com** / admin123 (Administratorius)
- **quality@example.com** / quality123 (Kokybės vertintojas)
- **user@example.com** / user123 (Vartotojas)

### 3. Paleiskite serverį
```bash
$env:DATABASE_URL="file:./dev.db"; $env:NEXTAUTH_URL="http://localhost:3000"; $env:NEXTAUTH_SECRET="your-secret-key-here"; npm run dev
```

## 📊 Vertinimo metrikos

Kiekviena metrika vertinama nuo **1 (blogai)** iki **10 (puikiai)**:

| Emoji | Metrika | Aprašymas |
|-------|---------|-----------|
| 🎯 | **Paprastumas naudotis** | Ar sistema lengvai naudojama? |
| ⚡ | **Greitis** | Ar sistema greitai veikia? |
| 🎨 | **Spalvų paletė** | Ar spalvos gražios ir tinkamos? |
| ✍️ | **Šrifto stilius** | Ar šriftas gražus ir tinkamas? |
| 👓 | **Šrifto skaitomumas** | Ar tekstą lengva perskaityti? |
| 💡 | **Turinio aiškumas** | Ar turinys suprantamas? |
| 📚 | **Turinio kiekis** | Ar pakanka/per daug informacijos? |
| 🗣️ | **Tonas** | Ar komunikacijos tonas tinkamas? |
| 🔒 | **Patikimumas** | Ar sistema patikima? |
| 💬 | **Komunikacija** | Ar pranešimai aiškūs ir informatyvūs? |

## 🎯 Kaip veikia sistema?

### Vartotojo perspektyva

1. **Prisijungimas**: Vartotojas prisijungia su `user@example.com`
2. **Pranešimas**: Po 5 sekundžių pasirodys pranešimas įvertinti patirtį
3. **Įvertinimas**: Vartotojas įvertina 10 metrikų nuo 1 iki 10
4. **Komentaras**: Gali palikti papildomą komentarą (nebūtinas)
5. **Pateikimas**: Atsiliepimas išsaugomas duomenų bazėje

### Kokybės vertintojo perspektyva

1. **Prisijungimas**: Prisijungia su `quality@example.com`
2. **Dashboard**: Mato visus atsiliepimus ir statistiką:
   - Bendrą atsiliepimų skaičių
   - Vidutinį įvertinimą
   - Geriausią rodiklį
   - Atsiliepimų su komentarais skaičių
3. **Analizė**: Gali analizuoti:
   - Vidutinius įvertinimus pagal kiekvieną metriką
   - Detalinius atsiliepimus kiekvieno vartotojo
   - Vartotojų komentarus

## 🎨 UI dizainas

### Feedback komponentas
- **Pranešimas**: Patrauklus pranešimas dešiniame apačios kampe
- **Forma**: Pilna forma su range slider'iais
- **Vizualinė grįžtamoji informacija**: Realus laiko įvertinimas
- **Spalvų kodavimas**: 
  - 🟢 8-10 (Puikiai)
  - 🟡 6-7 (Gerai)
  - 🟠 4-5 (Vidutiniškai)
  - 🔴 1-3 (Blogai)

### Quality Evaluator Dashboard
- **Statistikos kortelės**: Pagrindiniai rodikliai
- **Metrikos vidurkiai**: Vizualiniai rodikliai su emoji
- **Atsiliepimai**: Detalūs atsiliepimų sąrašai
- **Spalvų kodavimas**: Pagal įvertinimus

## 📁 Failų struktūra

### Nauji failai:
```
src/
  components/
    FeedbackPrompt.tsx          # Feedback pranešimas ir forma
  app/
    api/
      feedback/
        route.ts                # Feedback API (GET, POST)
      quality-evaluator/
        feedbacks/
          route.ts              # Quality evaluator API (GET)
    quality-evaluator/
      dashboard/
        page.tsx                # Kokybės vertintojo dashboard
```

### Atnaujinti failai:
```
prisma/
  schema.prisma                 # Pridėtas Feedback modelis
scripts/
  create-admin.js              # Atnaujintas sukurti 3 vartotojus
src/
  app/
    page.tsx                   # Atnaujintas routing'as
    auth/signin/page.tsx       # Atnaujintas routing'as
    user/dashboard/page.tsx    # Pridėtas FeedbackPrompt
```

## 🔒 Saugumas

- Visi API endpoint'ai reikalauja autentifikacijos
- Quality Evaluator API prieinamas tik QUALITY_EVALUATOR rolei
- Feedback API prieinamas tik prisijungusiems vartotojams
- Vartotojas gali palikti tik vieną atsiliepimą

## 📈 Statistika

Kokybės vertintojas mato:
- **Total**: Iš viso atsiliepimų
- **Average**: Vidutinis įvertinimas (vidurkis visų metrikų)
- **Best Score**: Geriausias rodiklis
- **With Comments**: Atsiliepimų su komentarais

Kiekvienai metrikai skaičiuojamas:
- **Vidurkis**: Suma / Kiekis
- **Overall**: (Suma visų metrikų) / (Kiekis × 10)

## 🎭 Testavimas

### 1. Testuoti kaip vartotojas:
1. Prisijunkite: `user@example.com` / `user123`
2. Palaukite 5 sekundes
3. Įvertinkite sistemą
4. Pateikite atsiliepimą

### 2. Testuoti kaip kokybės vertintojas:
1. Prisijunkite: `quality@example.com` / `quality123`
2. Peržiūrėkite statistiką
3. Analizuokite atsiliepimus

### 3. Testuoti kaip admin:
1. Prisijunkite: `admin@example.com` / `admin123`
2. Valdykite užklausas kaip įprastai

## 🐛 Galimos problemos

### Feedback nepasirodė?
- Patikrinkite ar esate prisijungę kaip USER
- Patikrinkite ar jau nėra palikę atsiliepimo
- Atnaujinkite puslapį

### Nematau atsiliepimų?
- Patikrinkite ar esate prisijungę kaip QUALITY_EVALUATOR
- Patikrinkite ar yra bent vienas atsiliepimas sistemoje

### Duomenų bazės klaida?
```bash
# Perkurkite duomenų bazę
$env:DATABASE_URL="file:./dev.db"; npx prisma db push --force-reset
$env:DATABASE_URL="file:./dev.db"; node scripts/create-admin.js
```

## 🎉 Sėkmės!

Dabar turite visiškai veikiančią kokybės vertinimo sistemą su 3 rolėmis!

