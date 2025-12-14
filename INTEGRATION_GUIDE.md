# 🚀 Guia Rápido de Integração

## ✅ SQL Executado com Sucesso!

Agora vamos integrar os componentes no Dashboard.

---

## 📋 Checklist de Integração:

### **Passo 1: Verificar Compilação** ✅
- [x] Servidor rodando em `http://localhost:3000`
- [ ] Abrir navegador e verificar se carrega sem erros
- [ ] Abrir Console (F12) e verificar se há erros

### **Passo 2: Atualizar Serviços**

#### **A) Atualizar `services/preferences.ts`**

Adicionar funções para novos campos:

```typescript
// Adicionar ao preferencesService:

updateProgressionMode: async (userId: string, mode: 'automatic' | 'manual'): Promise<void> => {
  const { error } = await supabase
    .from('user_preferences')
    .update({ progression_mode: mode })
    .eq('user_id', userId);

  if (error) throw error;
},

updateManualLevel: async (userId: string, level: Difficulty): Promise<void> => {
  const { error } = await supabase
    .from('user_preferences')
    .update({ 
      manual_level: level,
      level: level // Atualizar também o nível atual
    })
    .eq('user_id', userId);

  if (error) throw error;
},
```

#### **B) Atualizar `services/plans.ts`**

Adicionar função para ajustar dificuldade:

```typescript
// Adicionar ao plansService:

adjustDifficulty: async (
  planId: string, 
  newDifficulty: Difficulty, 
  reason?: string
): Promise<void> => {
  // 1. Buscar plano atual
  const { data: plan, error: fetchError } = await supabase
    .from('training_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (fetchError) throw fetchError;

  // 2. Criar registro de histórico
  const historyEntry = {
    date: new Date().toISOString(),
    oldDifficulty: plan.current_difficulty || plan.metadata?.level,
    newDifficulty,
    reason
  };

  const newHistory = [...(plan.difficulty_history || []), historyEntry];

  // 3. Atualizar plano
  const { error: updateError } = await supabase
    .from('training_plans')
    .update({
      current_difficulty: newDifficulty,
      difficulty_history: newHistory,
      // Aqui você pode adicionar lógica para recalcular o schedule
    })
    .eq('id', planId);

  if (updateError) throw updateError;
},
```

### **Passo 3: Integrar no Dashboard**

#### **Opção A: Criar Seção de Configurações**

Criar novo arquivo `components/SettingsPanel.tsx`:

```typescript
import React from 'react';
import ProgressionSettings from './ProgressionSettings';
import FeedPreferences from './FeedPreferences';
import DifficultyAdjuster from './DifficultyAdjuster';
import { UserPreferences, TrainingPlan } from '../types';

interface SettingsPanelProps {
  preferences: UserPreferences;
  activePlan?: TrainingPlan;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  onAdjustDifficulty: (newDifficulty: Difficulty, reason?: string) => Promise<void>;
}

export default function SettingsPanel({
  preferences,
  activePlan,
  onUpdatePreferences,
  onAdjustDifficulty
}: SettingsPanelProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Configurações
      </h2>
      
      <ProgressionSettings 
        preferences={preferences}
        onUpdate={onUpdatePreferences}
      />
      
      <FeedPreferences 
        preferences={preferences}
        onUpdate={onUpdatePreferences}
      />
      
      {activePlan && (
        <DifficultyAdjuster 
          plan={activePlan}
          onAdjust={onAdjustDifficulty}
        />
      )}
    </div>
  );
}
```

#### **Opção B: Adicionar Diretamente no Dashboard**

No arquivo onde você tem o Dashboard, adicionar:

```typescript
import ProgressionSettings from './components/ProgressionSettings';
import FeedPreferences from './components/FeedPreferences';
import DifficultyAdjuster from './components/DifficultyAdjuster';

// Dentro do componente Dashboard:
<div className="max-w-4xl mx-auto p-6">
  {/* Seus componentes existentes */}
  
  {/* Novas configurações */}
  <ProgressionSettings 
    preferences={preferences}
    onUpdate={handleUpdatePreferences}
  />
  
  <FeedPreferences 
    preferences={preferences}
    onUpdate={handleUpdatePreferences}
  />
  
  {activePlan && (
    <DifficultyAdjuster 
      plan={activePlan}
      onAdjust={handleAdjustDifficulty}
    />
  )}
</div>
```

### **Passo 4: Implementar Handlers**

No componente pai (App.tsx ou Dashboard):

```typescript
const handleUpdatePreferences = async (updates: Partial<UserPreferences>) => {
  if (!user?.id) return;
  
  try {
    // Atualizar localmente
    setPreferences(prev => ({ ...prev, ...updates }));
    
    // Salvar no Supabase
    await preferencesService.save(user.id, { ...preferences, ...updates });
    
    // Se mudou objetivo, duração ou frequência, recalcular plano
    if (updates.goal || updates.duration || updates.frequency) {
      // Recalcular plano aqui
      console.log('Recalculando plano...');
    }
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
  }
};

const handleAdjustDifficulty = async (newDifficulty: Difficulty, reason?: string) => {
  if (!activePlan) return;
  
  try {
    await plansService.adjustDifficulty(activePlan.id, newDifficulty, reason);
    
    // Recarregar plano
    const updatedPlan = await plansService.getById(activePlan.id);
    // Atualizar estado com plano atualizado
    
    console.log('Dificuldade ajustada com sucesso!');
  } catch (error) {
    console.error('Erro ao ajustar dificuldade:', error);
    throw error;
  }
};
```

---

## 🧪 Teste Rápido:

### **1. Verificar se Compila**
```bash
# O servidor já está rodando
# Abra http://localhost:3000
# Verifique se não há erros no console
```

### **2. Testar Componentes Isoladamente**

Você pode testar cada componente criando uma rota temporária:

```typescript
// Em App.tsx, adicionar temporariamente:
if (viewState === 'TESTING') {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ProgressionSettings 
        preferences={preferences}
        onUpdate={(updates) => {
          console.log('Updates:', updates);
          return Promise.resolve();
        }}
      />
    </div>
  );
}
```

---

## 🎯 Próximos Passos Imediatos:

1. **Abra o navegador** em `http://localhost:3000`
2. **Verifique o Console** (F12) - há erros?
3. **Me diga o status:**
   - ✅ Carregou sem erros
   - ❌ Tem erros (me mostre quais)

---

**Está carregando sem erros? Me avise para continuarmos a integração!** 🚀
