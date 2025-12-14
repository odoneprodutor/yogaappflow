# 🧪 Guia de Teste - YogaFlow com Supabase

## ✅ Pré-requisitos

1. ✅ Script `supabase-setup.sql` executado
2. ⏳ Script `supabase-tables.sql` **precisa ser executado agora** (com a coluna `description` adicionada)
3. ✅ Servidor de desenvolvimento rodando (`npm run dev`)

## 🚀 Passo a Passo para Testar

### 1. Execute o Script SQL Atualizado

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor** → **New Query**
3. Copie e cole o conteúdo **atualizado** de `supabase-tables.sql`
4. Clique em **Run**
5. Aguarde a mensagem de sucesso ✅

### 2. Teste a Aplicação Localmente

#### A) **Criar Nova Conta**

1. Acesse `http://localhost:5173` (ou a porta que aparecer no terminal)
2. Clique em **"Criar Conta"**
3. Preencha:
   - Nome: `Seu Nome`
   - Email: `teste@yogaflow.com`
   - Senha: `senha123`
4. Clique em **"Cadastrar"**

**O que acontece no Supabase:**
- ✅ Usuário criado em `Authentication` → `Users`
- ✅ Perfil criado na tabela `profiles`

#### B) **Complete o Onboarding**

1. Preencha suas informações:
   - Idade: `30`
   - Peso: `70` (opcional)
2. Selecione áreas de desconforto (ou "Nenhum")
3. Escolha nível: `Iniciante`
4. Frequência: `3 dias`
5. Objetivo: `Relaxamento`
6. Duração: `15 minutos`

**O que acontece no Supabase:**
- ✅ Preferências salvas na tabela `user_preferences`
- ✅ Plano criado na tabela `training_plans`

#### C) **Marque uma Sessão como Completa**

1. No Dashboard, clique em **"Começar Prática"**
2. Complete a rotina (ou pule para o final)
3. Responda o feedback pós-prática
4. Clique em **"Concluir"**

**O que acontece no Supabase:**
- ✅ Sessão salva na tabela `session_records`
- ✅ Progresso do plano atualizado em `training_plans`

### 3. Verifique no Supabase Dashboard

#### A) **Verificar Autenticação**
1. Vá em **Authentication** → **Users**
2. Você deve ver seu usuário criado com o email `teste@yogaflow.com`

#### B) **Verificar Tabelas**

**Profiles:**
```
Table Editor → profiles
```
Deve mostrar:
- `id`: UUID do usuário
- `name`: Seu nome
- `email`: teste@yogaflow.com

**User Preferences:**
```
Table Editor → user_preferences
```
Deve mostrar:
- `level`: Iniciante
- `goal`: Relaxamento
- `duration`: 15
- `frequency`: 3
- `has_onboarded`: true

**Training Plans:**
```
Table Editor → training_plans
```
Deve mostrar:
- `name`: Nome do plano gerado
- `description`: Descrição do plano
- `status`: active
- `progress`: 0 (ou maior se completou sessão)
- `schedule`: JSON com dias da semana
- `weeks`: JSON com 4 semanas

**Session Records:**
```
Table Editor → session_records
```
Deve mostrar (se completou uma sessão):
- `routine_name`: Nome da rotina
- `duration`: 15
- `date`: Data de hoje
- `feedback`: JSON com respostas

### 4. Teste Multi-Dispositivo (Opcional)

1. **Faça logout** no navegador atual
2. **Abra em outro navegador** ou **modo anônimo**
3. **Faça login** com as mesmas credenciais
4. **Verifique** se todos os dados aparecem:
   - ✅ Preferências carregadas
   - ✅ Plano ativo visível
   - ✅ Histórico de sessões

**Isso prova que os dados estão no Supabase, não no localStorage!** 🎉

## 🐛 Solução de Problemas

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe
- Confirme que as variáveis estão corretas:
  ```
  VITE_SUPABASE_URL=https://rtuhrbndltaztgidsqgk.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGci...
  ```
- Reinicie o servidor: `Ctrl+C` e `npm run dev`

### Erro: "relation does not exist"
- Execute o script `supabase-tables.sql` no Supabase Dashboard
- Verifique se todas as tabelas foram criadas

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram criadas corretamente
- Tente reexecutar o script SQL

### Dados não aparecem após login
- Abra o **Console do Navegador** (F12)
- Procure por erros em vermelho
- Verifique se o `user_id` está correto

## ✅ Checklist de Validação

- [ ] Script SQL executado com sucesso
- [ ] Conta criada com sucesso
- [ ] Onboarding completado
- [ ] Plano criado e visível
- [ ] Sessão marcada como completa
- [ ] Dados visíveis no Supabase Dashboard
- [ ] Login funciona em outro navegador
- [ ] Dados sincronizados entre dispositivos

## 🎉 Sucesso!

Se todos os itens acima funcionaram, **parabéns!** 🎊

Seu YogaFlow está:
- ✅ Salvando dados no Supabase
- ✅ Sincronizando entre dispositivos
- ✅ Protegido com RLS
- ✅ Pronto para produção!

## 📊 Próximos Passos

1. **Deploy para produção** (Vercel, Netlify, etc)
2. **Configurar domínio customizado**
3. **Adicionar analytics**
4. **Implementar funcionalidades avançadas**

---

**Dúvidas?** Verifique a documentação em `MIGRATION_COMPLETE.md`
