# 🚀 Guia de Execução - Setup Completo do Banco de Dados

## 📋 O que este script faz:

### ✅ PARTE 1: Habilita RLS nas Tabelas Existentes
- `users` - Protege dados de usuários
- `user_plans` - Protege planos de usuários
- `articles` - Permite leitura pública, escrita apenas do dono
- `poses` - Permite leitura pública (biblioteca global)

### ✅ PARTE 2: Cria Tabelas Faltantes
- `profiles` - Dados adicionais do perfil (nome, avatar, etc)
- `user_preferences` - Preferências (nível, objetivo, duração, etc)
- `training_plans` - Planos de treino personalizados
- `session_records` - Histórico de sessões completadas
- `weekly_context` - Contexto semanal do usuário

### ✅ PARTE 3: Adiciona Funcionalidades
- View `user_stats` - Estatísticas do usuário
- Função `get_active_plan()` - Busca plano ativo
- Função `calculate_streak()` - Calcula dias consecutivos

---

## 🎯 Como Executar:

### 1. Abra o Supabase Dashboard
```
https://app.supabase.com
```

### 2. Selecione seu Projeto
- Clique no projeto `rtuhrbndltaztgidsqgk`

### 3. Vá para SQL Editor
- Menu lateral → **SQL Editor**
- Clique em **New Query**

### 4. Cole o Script
- Abra o arquivo `supabase-complete-setup.sql`
- **Copie TODO o conteúdo**
- Cole no SQL Editor

### 5. Execute
- Clique em **Run** (ou Ctrl+Enter)
- Aguarde a execução (pode levar alguns segundos)

### 6. Verifique o Resultado
Deve aparecer:
```
Success. No rows returned
```

---

## ✅ Verificação Pós-Execução

### A) Verificar Tabelas Criadas

Vá em **Table Editor** e confirme que existem:

**Tabelas Existentes (agora com RLS):**
- ✅ `users` - 🔒 RLS enabled
- ✅ `user_plans` - 🔒 RLS enabled
- ✅ `articles` - 🔒 RLS enabled
- ✅ `poses` - 🔒 RLS enabled

**Tabelas Novas:**
- ✅ `profiles` - 🔒 RLS enabled
- ✅ `user_preferences` - 🔒 RLS enabled
- ✅ `training_plans` - 🔒 RLS enabled
- ✅ `session_records` - 🔒 RLS enabled
- ✅ `weekly_context` - 🔒 RLS enabled

### B) Verificar RLS

Para cada tabela:
1. Clique na tabela
2. Procure o ícone de **escudo** 🔒
3. Deve estar **verde** (RLS enabled)
4. Clique nele para ver as políticas

### C) Verificar Políticas

Cada tabela deve ter políticas como:
- ✅ "Users can view own..."
- ✅ "Users can insert own..."
- ✅ "Users can update own..."
- ✅ "Users can delete own..."

---

## 📊 Estrutura Final do Banco

```
YogaFlow Database
│
├── 👤 Autenticação (Supabase Auth)
│   └── auth.users
│
├── 👥 Perfis e Preferências
│   ├── profiles (dados do perfil)
│   ├── user_preferences (configurações)
│   └── users (dados legados)
│
├── 📋 Planos e Treinos
│   ├── training_plans (planos novos)
│   ├── user_plans (planos legados)
│   └── session_records (histórico)
│
├── 📚 Conteúdo
│   ├── poses (biblioteca de poses)
│   ├── articles (artigos)
│   └── weekly_context (contexto semanal)
│
└── 📊 Views e Funções
    ├── user_stats (estatísticas)
    ├── get_active_plan() (plano ativo)
    └── calculate_streak() (streak)
```

---

## 🔐 Segurança Implementada

### Row Level Security (RLS)

**O que é?**
- Cada usuário só vê/edita seus próprios dados
- Impossível acessar dados de outros usuários
- Proteção automática no nível do banco

**Como funciona?**
```sql
-- Exemplo: Usuário só vê suas próprias preferências
CREATE POLICY "Users can view own preferences" 
  ON user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);
```

**Resultado:**
- ✅ Usuário A vê apenas dados do Usuário A
- ✅ Usuário B vê apenas dados do Usuário B
- ❌ Usuário A NÃO vê dados do Usuário B

---

## 🆘 Solução de Problemas

### Erro: "relation already exists"
**Solução:** Isso é normal! Significa que a tabela já existe. O script usa `CREATE TABLE IF NOT EXISTS`, então não há problema.

### Erro: "policy already exists"
**Solução:** O script usa `DROP POLICY IF EXISTS` antes de criar, então deve funcionar. Se persistir, execute novamente.

### Erro: "function update_updated_at_column() does not exist"
**Solução:** Execute primeiro o `supabase-setup.sql` que cria essa função.

### Tabelas não aparecem no Table Editor
**Solução:** 
1. Recarregue a página (F5)
2. Verifique se o script foi executado com sucesso
3. Procure por erros na execução

---

## 🎉 Próximos Passos

Após executar o script:

1. ✅ **Testar a Aplicação**
   - Criar nova conta
   - Completar onboarding
   - Verificar se dados aparecem nas novas tabelas

2. ✅ **Migrar Dados Antigos** (Opcional)
   - Se tiver dados em `users` e `user_plans`
   - Posso criar um script de migração

3. ✅ **Limpar Dados de Teste**
   - Deletar usuários de teste
   - Limpar tabelas antigas se não precisar

4. ✅ **Deploy para Produção**
   - Aplicação está pronta!

---

## 📝 Checklist de Execução

- [ ] Abri o Supabase Dashboard
- [ ] Selecionei o projeto correto
- [ ] Fui em SQL Editor → New Query
- [ ] Copiei TODO o conteúdo de `supabase-complete-setup.sql`
- [ ] Colei no editor
- [ ] Cliquei em Run
- [ ] Recebi "Success. No rows returned"
- [ ] Verifiquei que as tabelas foram criadas
- [ ] Verifiquei que RLS está habilitado
- [ ] Testei a aplicação

---

**Pronto para executar? Execute o script e me avise se deu tudo certo! 🚀**
