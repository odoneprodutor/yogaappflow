-- ============================================
-- TABELA: user_preferences
-- Armazena as preferências de cada usuário
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
  discomforts TEXT[], -- Array de desconfortos: ['Lombar', 'Joelhos', etc]
  has_onboarded BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Um usuário tem apenas uma preferência ativa
);

-- RLS para user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences (user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: training_plans
-- Armazena os planos de treino personalizados
-- ============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  stage INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress NUMERIC(5,2) DEFAULT 0, -- Porcentagem de 0 a 100
  completed_sessions INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  schedule JSONB NOT NULL, -- Array de dias da semana com atividades
  weeks JSONB, -- Array de semanas (para planos de 4 semanas)
  reasoning TEXT[], -- Array de razões/explicações do plano
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para training_plans
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON training_plans FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own plans" ON training_plans FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own plans" ON training_plans FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own plans" ON training_plans FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS training_plans_user_id_idx ON training_plans (user_id);

CREATE INDEX IF NOT EXISTS training_plans_status_idx ON training_plans (status);

-- Trigger para updated_at
CREATE TRIGGER update_training_plans_updated_at 
  BEFORE UPDATE ON training_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: session_records
-- Armazena o histórico de sessões completadas
-- ============================================
CREATE TABLE IF NOT EXISTS session_records (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES training_plans (id) ON DELETE SET NULL,
    date DATE NOT NULL,
    routine_name TEXT NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    feedback JSONB, -- Feedback estruturado da sessão
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- RLS para session_records
ALTER TABLE session_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON session_records FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own sessions" ON session_records FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own sessions" ON session_records FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own sessions" ON session_records FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS session_records_user_id_idx ON session_records (user_id);

CREATE INDEX IF NOT EXISTS session_records_date_idx ON session_records (date);

CREATE INDEX IF NOT EXISTS session_records_plan_id_idx ON session_records (plan_id);

-- ============================================
-- TABELA: weekly_context
-- Armazena o contexto semanal do usuário
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_context (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    feedback JSONB NOT NULL, -- Feedback estruturado da semana
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (user_id, week_start) -- Um contexto por semana por usuário
);

-- RLS para weekly_context
ALTER TABLE weekly_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly context" ON weekly_context FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own weekly context" ON weekly_context FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own weekly context" ON weekly_context FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own weekly context" ON weekly_context FOR DELETE USING (auth.uid () = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS weekly_context_user_id_idx ON weekly_context (user_id);

CREATE INDEX IF NOT EXISTS weekly_context_week_start_idx ON weekly_context (week_start);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para estatísticas do usuário
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
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para obter o plano ativo do usuário
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

-- Função para calcular streak (dias consecutivos)
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