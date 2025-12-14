-- ============================================
-- SCRIPT DE MIGRAÇÃO - VERSÃO SEGURA
-- Este script pode ser executado múltiplas vezes
-- ============================================

-- ============================================
-- TABELA: user_preferences
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Iniciante', 'Intermediário', 'Avançado')),
  goal TEXT NOT NULL CHECK (goal IN ('Flexibilidade', 'Força', 'Relaxamento', 'Alívio de Dor')),
  duration INTEGER NOT NULL CHECK (duration IN (15, 30, 45)),
  frequency INTEGER NOT NULL CHECK (frequency >= 2 AND frequency <= 7),
  age INTEGER,
  weight INTEGER,
  discomforts TEXT[],
  has_onboarded BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_preferences_user_id_key'
  ) THEN
    ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE(user_id);
  END IF;
END $$;

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas (DROP IF EXISTS para recriar)
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences" ON user_preferences FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

CREATE POLICY "Users can insert own preferences" ON user_preferences FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Users can update own preferences" ON user_preferences FOR
UPDATE USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences (user_id);

-- Trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: training_plans
-- ============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  stage INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress NUMERIC(5,2) DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  schedule JSONB NOT NULL,
  weeks JSONB,
  reasoning TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna description se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'training_plans' AND column_name = 'description'
  ) THEN
    ALTER TABLE training_plans ADD COLUMN description TEXT DEFAULT '';
  END IF;
END $$;

-- RLS
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view own plans" ON training_plans;

CREATE POLICY "Users can view own plans" ON training_plans FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can insert own plans" ON training_plans;

CREATE POLICY "Users can insert own plans" ON training_plans FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own plans" ON training_plans;

CREATE POLICY "Users can update own plans" ON training_plans FOR
UPDATE USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete own plans" ON training_plans;

CREATE POLICY "Users can delete own plans" ON training_plans FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS training_plans_user_id_idx ON training_plans (user_id);

CREATE INDEX IF NOT EXISTS training_plans_status_idx ON training_plans (status);

-- Trigger
DROP TRIGGER IF EXISTS update_training_plans_updated_at ON training_plans;

CREATE TRIGGER update_training_plans_updated_at 
  BEFORE UPDATE ON training_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: session_records
-- ============================================
CREATE TABLE IF NOT EXISTS session_records (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES training_plans (id) ON DELETE SET NULL,
    date DATE NOT NULL,
    routine_name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    feedback JSONB,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE session_records ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view own sessions" ON session_records;

CREATE POLICY "Users can view own sessions" ON session_records FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON session_records;

CREATE POLICY "Users can insert own sessions" ON session_records FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON session_records;

CREATE POLICY "Users can update own sessions" ON session_records FOR
UPDATE USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON session_records;

CREATE POLICY "Users can delete own sessions" ON session_records FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS session_records_user_id_idx ON session_records (user_id);

CREATE INDEX IF NOT EXISTS session_records_date_idx ON session_records (date);

CREATE INDEX IF NOT EXISTS session_records_plan_id_idx ON session_records (plan_id);

-- ============================================
-- TABELA: weekly_context
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_context (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    feedback JSONB NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint UNIQUE se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'weekly_context_user_id_week_start_key'
  ) THEN
    ALTER TABLE weekly_context ADD CONSTRAINT weekly_context_user_id_week_start_key UNIQUE(user_id, week_start);
  END IF;
END $$;

-- RLS
ALTER TABLE weekly_context ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view own weekly context" ON weekly_context;

CREATE POLICY "Users can view own weekly context" ON weekly_context FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can insert own weekly context" ON weekly_context;

CREATE POLICY "Users can insert own weekly context" ON weekly_context FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own weekly context" ON weekly_context;

CREATE POLICY "Users can update own weekly context" ON weekly_context FOR
UPDATE USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete own weekly context" ON weekly_context;

CREATE POLICY "Users can delete own weekly context" ON weekly_context FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS weekly_context_user_id_idx ON weekly_context (user_id);

CREATE INDEX IF NOT EXISTS weekly_context_week_start_idx ON weekly_context (week_start);

-- ============================================
-- VIEWS
-- ============================================
CREATE OR REPLACE VIEW user_stats AS
SELECT
    sr.user_id,
    COUNT(*) as total_sessions,
    SUM(sr.duration) as total_minutes,
    MAX(sr.date) as last_session_date,
    MIN(sr.date) as first_session_date
FROM session_records sr
GROUP BY
    sr.user_id;

-- ============================================
-- FUNÇÕES
-- ============================================
CREATE OR REPLACE FUNCTION get_active_plan(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  stage INTEGER,
  progress NUMERIC,
  completed_sessions INTEGER,
  total_sessions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.name,
    tp.stage,
    tp.progress,
    tp.completed_sessions,
    tp.total_sessions
  FROM training_plans tp
  WHERE tp.user_id = p_user_id 
    AND tp.status = 'active'
  ORDER BY tp.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_has_session BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM session_records 
      WHERE user_id = p_user_id 
        AND date = v_current_date
    ) INTO v_has_session;
    
    IF NOT v_has_session THEN
      EXIT;
    END IF;
    
    v_streak := v_streak + 1;
    v_current_date := v_current_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;