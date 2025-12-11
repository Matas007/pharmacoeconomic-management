-- Supabase RLS (Row Level Security) Setup
-- Šis failas sukuria saugos politikas duomenų bazėje

-- 1. USERS lentelė
-- Įjungiame RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti vartotojus (reikalinga auth sistemai)
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT
    USING (true);

-- Politika: Service role gali viską daryti (NextAuth naudoja service role)
CREATE POLICY "Enable all access for service role" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. REQUESTS lentelė
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti (autentifikacija tvarkoma aplikacijos lygmenyje)
CREATE POLICY "Enable read access for all users" ON requests
    FOR SELECT
    USING (true);

-- Politika: Visi gali kurti
CREATE POLICY "Enable insert for all users" ON requests
    FOR INSERT
    WITH CHECK (true);

-- Politika: Visi gali atnaujinti
CREATE POLICY "Enable update for all users" ON requests
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 3. FEEDBACKS lentelė
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti
CREATE POLICY "Enable read access for all users" ON feedbacks
    FOR SELECT
    USING (true);

-- Politika: Visi gali kurti
CREATE POLICY "Enable insert for all users" ON feedbacks
    FOR INSERT
    WITH CHECK (true);

-- 4. TASKS lentelė
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti
CREATE POLICY "Enable read access for all users" ON tasks
    FOR SELECT
    USING (true);

-- Politika: Visi gali kurti
CREATE POLICY "Enable insert for all users" ON tasks
    FOR INSERT
    WITH CHECK (true);

-- Politika: Visi gali atnaujinti
CREATE POLICY "Enable update for all users" ON tasks
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Politika: Visi gali trinti
CREATE POLICY "Enable delete for all users" ON tasks
    FOR DELETE
    USING (true);

-- 5. SUBTASKS lentelė
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti
CREATE POLICY "Enable read access for all users" ON subtasks
    FOR SELECT
    USING (true);

-- Politika: Visi gali kurti
CREATE POLICY "Enable insert for all users" ON subtasks
    FOR INSERT
    WITH CHECK (true);

-- Politika: Visi gali atnaujinti
CREATE POLICY "Enable update for all users" ON subtasks
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Politika: Visi gali trinti
CREATE POLICY "Enable delete for all users" ON subtasks
    FOR DELETE
    USING (true);

-- 6. CHAT_ROOMS lentelė
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti
CREATE POLICY "Enable read access for all users" ON chat_rooms
    FOR SELECT
    USING (true);

-- Politika: Visi gali kurti
CREATE POLICY "Enable insert for all users" ON chat_rooms
    FOR INSERT
    WITH CHECK (true);

-- Politika: Visi gali atnaujinti
CREATE POLICY "Enable update for all users" ON chat_rooms
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 7. CHAT_MESSAGES lentelė
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti
CREATE POLICY "Enable read access for all users" ON chat_messages
    FOR SELECT
    USING (true);

-- Politika: Visi gali kurti
CREATE POLICY "Enable insert for all users" ON chat_messages
    FOR INSERT
    WITH CHECK (true);

-- Politika: Visi gali atnaujinti
CREATE POLICY "Enable update for all users" ON chat_messages
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 8. CHAT_ACCESSES lentelė
ALTER TABLE chat_accesses ENABLE ROW LEVEL SECURITY;

-- Politika: Visi gali skaityti
CREATE POLICY "Enable read access for all users" ON chat_accesses
    FOR SELECT
    USING (true);

-- Politika: Visi gali kurti
CREATE POLICY "Enable insert for all users" ON chat_accesses
    FOR INSERT
    WITH CHECK (true);

-- Politika: Visi gali atnaujinti
CREATE POLICY "Enable update for all users" ON chat_accesses
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- PASTABA: Šios politikos yra permissive (leidžiančios), nes:
-- 1. Autentifikacija tvarkoma NextAuth.js lygmenyje
-- 2. Prisma klientas jungiasi kaip service role
-- 3. API route'ai tikrina vartotojo teises
-- 
-- Production aplinkoje galėtumėte:
-- - Naudoti Supabase Auth vietoj NextAuth
-- - Sukurti griežtesnes RLS politikas pagal auth.uid()
-- - Naudoti JWT claims RLS politikose

