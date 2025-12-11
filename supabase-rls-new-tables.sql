-- RLS setup TIK NAUJOMS LENTELĖMS
-- Paleiskite šį SQL jei gaunate "policy already exists" klaidas

-- 1. TASKS lentelė
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Pirma ištrinti egzistuojančias politikas (jei yra)
DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON tasks;

-- Sukurti naujas politikas
CREATE POLICY "Enable read access for all users" ON tasks
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON tasks
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON tasks
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON tasks
    FOR DELETE
    USING (true);

-- 2. SUBTASKS lentelė
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON subtasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON subtasks;
DROP POLICY IF EXISTS "Enable update for all users" ON subtasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON subtasks;

CREATE POLICY "Enable read access for all users" ON subtasks
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON subtasks
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON subtasks
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON subtasks
    FOR DELETE
    USING (true);

-- 3. CHAT_ROOMS lentelė
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON chat_rooms;
DROP POLICY IF EXISTS "Enable insert for all users" ON chat_rooms;
DROP POLICY IF EXISTS "Enable update for all users" ON chat_rooms;

CREATE POLICY "Enable read access for all users" ON chat_rooms
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON chat_rooms
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_rooms
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. CHAT_MESSAGES lentelė
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON chat_messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON chat_messages;
DROP POLICY IF EXISTS "Enable update for all users" ON chat_messages;

CREATE POLICY "Enable read access for all users" ON chat_messages
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON chat_messages
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_messages
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 5. CHAT_ACCESSES lentelė
ALTER TABLE chat_accesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON chat_accesses;
DROP POLICY IF EXISTS "Enable insert for all users" ON chat_accesses;
DROP POLICY IF EXISTS "Enable update for all users" ON chat_accesses;

CREATE POLICY "Enable read access for all users" ON chat_accesses
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON chat_accesses
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_accesses
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ✅ BAIGTA! Visos 5 naujos lentelės dabar turi RLS

