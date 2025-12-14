# 🚀 Plano de Implementação - Novas Funcionalidades

## 📋 Funcionalidades a Implementar

### 1. **Controle de Avanço de Postura** 🎯
- [ ] Modo Automático vs Manual
- [ ] Lógica de progressão automática (taxa de sucesso)
- [ ] Interface de seleção manual
- [ ] Persistência da preferência no Supabase

### 2. **Configurações Detalhadas do Feed** ⚙️
- [ ] Seção de Preferências do Feed
- [ ] Ajuste de Frequência (diária/semanal)
- [ ] Ajuste de Duração das sessões
- [ ] Ajuste de Objetivo principal
- [ ] Atualização dinâmica do feed

### 3. **Ajuste de Dificuldade da Jornada** 📊
- [ ] Interface para ajustar dificuldade
- [ ] Lógica de recálculo de exercícios
- [ ] Manutenção do progresso anterior
- [ ] Reordenação de exercícios futuros

---

## 🗂️ Estrutura de Arquivos

### **Novos Tipos (types.ts)**
```typescript
// Adicionar ao UserPreferences
progressionMode?: 'automatic' | 'manual';
successRate?: number; // Taxa de sucesso para progressão automática

// Adicionar ao TrainingPlan
difficultyHistory?: {
  date: string;
  oldDifficulty: Difficulty;
  newDifficulty: Difficulty;
}[];
```

### **Novos Componentes**
- `components/ProgressionSettings.tsx` - Controle de modo de progressão
- `components/FeedPreferences.tsx` - Preferências do feed
- `components/DifficultyAdjuster.tsx` - Ajuste de dificuldade

### **Novos Serviços**
- `services/progression.ts` - Lógica de progressão automática
- `services/feedCustomization.ts` - Customização do feed

### **Atualizações no Banco de Dados**
- Adicionar campos em `user_preferences`
- Adicionar campos em `training_plans`

---

## 📐 Arquitetura das Funcionalidades

### **1. Controle de Avanço de Postura**

#### **Fluxo Automático:**
```
Usuário completa sessão
    ↓
Sistema calcula taxa de sucesso
    ↓
Taxa > 80%? → Avançar nível
Taxa 60-80%? → Manter nível
Taxa < 60%? → Revisar nível anterior
```

#### **Fluxo Manual:**
```
Usuário acessa configurações
    ↓
Seleciona "Modo Manual"
    ↓
Interface mostra níveis disponíveis
    ↓
Usuário escolhe próximo nível
```

#### **Dados Necessários:**
- `progressionMode`: 'automatic' | 'manual'
- `successRate`: número de 0-100
- `currentLevel`: Difficulty atual
- `availableLevels`: Níveis disponíveis

---

### **2. Configurações Detalhadas do Feed**

#### **Interface:**
```
┌─────────────────────────────────┐
│  Preferências do Feed           │
├─────────────────────────────────┤
│  Frequência:                    │
│  ○ Diária  ● Semanal            │
│                                 │
│  Duração das Sessões:           │
│  ○ 15min  ● 30min  ○ 45min      │
│                                 │
│  Objetivo Principal:            │
│  ○ Flexibilidade                │
│  ● Força                        │
│  ○ Relaxamento                  │
│  ○ Alívio de Dor                │
└─────────────────────────────────┘
```

#### **Lógica de Atualização:**
```typescript
1. Usuário altera preferência
2. Salvar no Supabase (user_preferences)
3. Recalcular plano de treino
4. Atualizar feed imediatamente
5. Mostrar feedback visual
```

---

### **3. Ajuste de Dificuldade da Jornada**

#### **Interface:**
```
┌─────────────────────────────────┐
│  Ajustar Dificuldade            │
├─────────────────────────────────┤
│  Dificuldade Atual: Iniciante   │
│                                 │
│  Nova Dificuldade:              │
│  ○ Iniciante                    │
│  ● Intermediário                │
│  ○ Avançado                     │
│                                 │
│  ⚠️ Isso irá recalcular seus    │
│     exercícios futuros          │
│                                 │
│  [Cancelar]  [Confirmar]        │
└─────────────────────────────────┘
```

#### **Lógica de Recálculo:**
```typescript
1. Capturar progresso atual (sessões completadas)
2. Gerar novo plano com nova dificuldade
3. Manter histórico de sessões anteriores
4. Recalcular exercícios futuros
5. Atualizar training_plan no Supabase
6. Registrar mudança em difficultyHistory
```

---

## 🗄️ Alterações no Banco de Dados

### **Script SQL: `supabase-new-features.sql`**

```sql
-- Adicionar campos em user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS progression_mode TEXT DEFAULT 'automatic' CHECK (progression_mode IN ('automatic', 'manual'));

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2) DEFAULT 0;

-- Adicionar campos em training_plans
ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS difficulty_history JSONB DEFAULT '[]';

ALTER TABLE training_plans 
ADD COLUMN IF NOT EXISTS current_difficulty TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS user_preferences_progression_mode_idx ON user_preferences(progression_mode);
CREATE INDEX IF NOT EXISTS training_plans_current_difficulty_idx ON training_plans(current_difficulty);
```

---

## 📝 Ordem de Implementação

### **Fase 1: Banco de Dados** ✅
1. Criar script SQL com novos campos
2. Executar no Supabase
3. Verificar criação

### **Fase 2: Tipos TypeScript** ✅
1. Atualizar `types.ts`
2. Atualizar interfaces

### **Fase 3: Serviços** ✅
1. Criar `services/progression.ts`
2. Criar `services/feedCustomization.ts`
3. Atualizar `services/preferences.ts`
4. Atualizar `services/plans.ts`

### **Fase 4: Componentes** ✅
1. Criar `ProgressionSettings.tsx`
2. Criar `FeedPreferences.tsx`
3. Criar `DifficultyAdjuster.tsx`

### **Fase 5: Integração** ✅
1. Integrar componentes no Dashboard
2. Conectar com Supabase
3. Testar fluxos completos

### **Fase 6: UX/UI** ✅
1. Adicionar animações
2. Feedback visual
3. Validações
4. Mensagens de sucesso/erro

---

## 🎨 Design UX

### **Princípios:**
- ✅ **Clareza**: Usuário entende o que cada opção faz
- ✅ **Feedback**: Confirmação visual de cada ação
- ✅ **Reversibilidade**: Fácil desfazer mudanças
- ✅ **Consistência**: Padrões visuais mantidos
- ✅ **Acessibilidade**: Funciona em mobile e desktop

### **Padrões de Interação:**
- Toggle switches para modo automático/manual
- Radio buttons para seleções únicas
- Modais de confirmação para ações críticas
- Toasts para feedback de sucesso
- Loading states durante salvamento

---

## 🧪 Testes

### **Cenários de Teste:**

**1. Progressão Automática:**
- [ ] Usuário completa sessão com 90% sucesso → Avança nível
- [ ] Usuário completa sessão com 50% sucesso → Mantém nível
- [ ] Sistema calcula corretamente taxa de sucesso

**2. Progressão Manual:**
- [ ] Usuário alterna para modo manual
- [ ] Interface mostra níveis disponíveis
- [ ] Seleção persiste no Supabase

**3. Preferências do Feed:**
- [ ] Alterar frequência atualiza feed
- [ ] Alterar duração recalcula plano
- [ ] Alterar objetivo muda exercícios

**4. Ajuste de Dificuldade:**
- [ ] Mudança de Iniciante → Intermediário funciona
- [ ] Progresso anterior é mantido
- [ ] Exercícios futuros são recalculados
- [ ] Histórico é registrado

---

## 📊 Métricas de Sucesso

- ✅ Usuário consegue alternar entre modos em < 3 cliques
- ✅ Preferências são salvas em < 2 segundos
- ✅ Feed atualiza imediatamente após mudança
- ✅ Ajuste de dificuldade mantém 100% do progresso
- ✅ Interface é intuitiva (sem necessidade de tutorial)

---

**Pronto para começar a implementação!** 🚀
