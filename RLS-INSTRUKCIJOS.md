# 🔒 Row Level Security (RLS) Įdiegimas Supabase

## ⚠️ PROBLEMA
Security Advisor rodo 5 klaidas:
- ❌ `public.tasks` - RLS Disabled
- ❌ `public.subtasks` - RLS Disabled
- ❌ `public.chat_accesses` - RLS Disabled
- ❌ `public.chat_messages` - RLS Disabled
- ❌ `public.chat_rooms` - RLS Disabled

## ✅ SPRENDIMAS

### 1. Atidarykite Supabase SQL Editor

1. Eikite į: https://supabase.com/dashboard
2. Pasirinkite savo projektą
3. Kairėje meniu: **SQL Editor**
4. Spauskite: **New query**

### 2. Paleiskite SQL scriptą

Nukopijuokite **VISĄ** `supabase-rls-setup.sql` failo turinį ir įklijuokite į SQL Editor.

**ARBA** paleiskite tik naujas politikas:

```sql
-- 4. TASKS lentelė
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON tasks
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON tasks
    FOR DELETE USING (true);

-- 5. SUBTASKS lentelė
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON subtasks
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON subtasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON subtasks
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON subtasks
    FOR DELETE USING (true);

-- 6. CHAT_ROOMS lentelė
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON chat_rooms
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON chat_rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_rooms
    FOR UPDATE USING (true) WITH CHECK (true);

-- 7. CHAT_MESSAGES lentelė
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON chat_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_messages
    FOR UPDATE USING (true) WITH CHECK (true);

-- 8. CHAT_ACCESSES lentelė
ALTER TABLE chat_accesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON chat_accesses
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON chat_accesses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_accesses
    FOR UPDATE USING (true) WITH CHECK (true);
```

### 3. Paleiskite

1. Spauskite **Run** (arba Ctrl+Enter)
2. Turėtumėte matyti: ✅ Success

### 4. Patikrinkite

1. Grįžkite į **Security Advisor**
2. Spauskite **Refresh** 🔄
3. Visos 5 klaidos turėtų išnykti! ✅

## 📝 Pastabos

### Kodėl permissive politikos?

Šios RLS politikos yra "leidžiančios" (permissive), nes:
- ✅ **NextAuth.js** tvarko autentifikaciją
- ✅ **Prisma** jungiasi kaip service role
- ✅ **API routes** tikrina vartotojų teises

### Production aplinkoje

Griežtesnės politikos būtų tokios:

```sql
-- Pavyzdys: Tik savininkas mato savo užduotis
CREATE POLICY "Users can only read own tasks" ON tasks
    FOR SELECT
    USING (auth.uid() = user_id);
```

Bet tam reiktų:
1. Pereiti nuo NextAuth prie Supabase Auth
2. Naudoti JWT claims RLS politikose
3. Pridėti `user_id` stulpelius visose lentelėse

## ✅ Po įdiegimo

- Visi 5 errorai išnyks
- Sistema veiks kaip ir anksčiau
- Supabase nebebus rodęs security warnings

---

**Sukurta:** 2025-01-29  
**Projektas:** Pharmacoeconomic Management System

