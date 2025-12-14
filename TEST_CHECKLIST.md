# ✅ Checklist de Teste - YogaFlow + Supabase

## 🎯 Objetivo
Verificar se a integração com Supabase está funcionando corretamente.

---

## 📋 PASSO 1: Verificar Servidor Local

1. ✅ O servidor está rodando? (`npm run dev`)
2. ✅ Qual é a URL? (geralmente `http://localhost:5173`)
3. ✅ Há erros no terminal? (verifique mensagens em vermelho)

**Ação:** Abra o navegador e acesse a URL do servidor.

---

## 📋 PASSO 2: Criar Nova Conta

### A) Abrir a Aplicação
- [ ] Página de login/cadastro apareceu?
- [ ] Há erros no Console do navegador? (F12 → Console)

### B) Criar Conta
Preencha:
- **Nome:** `Teste Supabase`
- **Email:** `teste@yogaflow.com`
- **Senha:** `senha123`

- [ ] Clicou em "Cadastrar"
- [ ] Apareceu algum erro?
- [ ] Foi redirecionado para o onboarding?

### C) Verificar no Supabase Dashboard
1. Abra: https://app.supabase.com
2. Vá em: **Authentication** → **Users**
3. **Verificar:**
   - [ ] Usuário `teste@yogaflow.com` foi criado?
   - [ ] Tem um UUID (id)?
   - [ ] Status está "Confirmed"?

4. Vá em: **Table Editor** → **profiles**
5. **Verificar:**
   - [ ] Há um registro com o nome "Teste Supabase"?
   - [ ] O email é `teste@yogaflow.com`?

**✅ Se SIM para tudo acima:** A autenticação está funcionando!
**❌ Se NÃO:** Anote o erro e me avise.

---

## 📋 PASSO 3: Completar Onboarding

### A) Preencher Informações
1. **Idade:** `30`
2. **Peso:** `70` (ou deixe em branco)
3. Clique em "Continuar"

4. **Desconfortos:** Selecione "Nenhum" (ou outro)
5. Clique em "Continuar"

6. **Nível:** Selecione "Iniciante"
7. (Deve avançar automaticamente)

8. **Frequência:** Selecione "3 dias"
9. (Deve avançar automaticamente)

10. **Objetivo:** Selecione "Relaxamento"
11. (Deve avançar automaticamente)

12. **Duração:** Selecione "15 minutos"
13. Clique em "Criar Meu Plano"

- [ ] Foi redirecionado para o Dashboard?
- [ ] Apareceu um plano de treino?
- [ ] Há erros no Console? (F12)

### B) Verificar no Supabase Dashboard

1. **Table Editor** → **user_preferences**
   - [ ] Há um registro?
   - [ ] `level` = "Iniciante"?
   - [ ] `goal` = "Relaxamento"?
   - [ ] `duration` = 15?
   - [ ] `frequency` = 3?
   - [ ] `has_onboarded` = true?

2. **Table Editor** → **training_plans**
   - [ ] Há um registro?
   - [ ] `name` tem algum nome de plano?
   - [ ] `description` tem texto?
   - [ ] `status` = "active"?
   - [ ] `schedule` tem JSON?
   - [ ] `weeks` tem JSON?

**✅ Se SIM para tudo acima:** O onboarding está salvando no Supabase!
**❌ Se NÃO:** Anote o erro e me avise.

---

## 📋 PASSO 4: Marcar Sessão como Completa

### A) Iniciar Prática
1. No Dashboard, clique em **"Começar Prática"**
2. Deve abrir o player de rotina
3. - [ ] Apareceu a rotina?
4. - [ ] Há poses listadas?

### B) Completar Prática
1. Pule para o final (ou complete normalmente)
2. Deve aparecer o feedback pós-prática
3. Responda as perguntas
4. Clique em "Concluir"

- [ ] Foi redirecionado para Journey/Dashboard?
- [ ] Apareceu alguma confirmação?
- [ ] Há erros no Console?

### C) Verificar no Supabase Dashboard

1. **Table Editor** → **session_records**
   - [ ] Há um registro?
   - [ ] `routine_name` tem o nome da rotina?
   - [ ] `duration` = 15?
   - [ ] `date` = data de hoje?
   - [ ] `feedback` tem JSON?

2. **Table Editor** → **training_plans**
   - [ ] O `progress` aumentou?
   - [ ] `completed_sessions` = 1?

**✅ Se SIM para tudo acima:** As sessões estão sendo salvas!
**❌ Se NÃO:** Anote o erro e me avise.

---

## 📋 PASSO 5: Teste Multi-Dispositivo

### A) Fazer Logout
1. Clique em "Sair" no canto superior
2. - [ ] Voltou para tela de login?

### B) Abrir em Modo Anônimo
1. Abra uma janela anônima (Ctrl+Shift+N no Chrome)
2. Acesse a mesma URL (`http://localhost:5173`)
3. Faça login com:
   - Email: `teste@yogaflow.com`
   - Senha: `senha123`

### C) Verificar Dados
- [ ] As preferências apareceram?
- [ ] O plano está visível?
- [ ] O histórico de sessões aparece?
- [ ] Tudo está igual à janela anterior?

**✅ Se SIM:** Os dados estão sincronizados via Supabase!
**❌ Se NÃO:** Os dados ainda estão no localStorage.

---

## 🐛 ERROS COMUNS

### Erro: "Missing Supabase environment variables"
**Solução:**
1. Verifique se `.env` existe
2. Confirme as variáveis:
   ```
   VITE_SUPABASE_URL=https://rtuhrbndltaztgidsqgk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
3. Reinicie o servidor: `Ctrl+C` e `npm run dev`

### Erro no Console: "Failed to fetch"
**Solução:**
1. Verifique se o Supabase está online
2. Confirme as credenciais no `.env`
3. Verifique a conexão de internet

### Erro: "new row violates row-level security policy"
**Solução:**
1. Execute novamente `supabase-migration-safe.sql`
2. Verifique se as políticas RLS foram criadas

### Dados não aparecem após login
**Solução:**
1. Abra o Console (F12)
2. Procure erros em vermelho
3. Verifique a aba "Network" para ver as requisições ao Supabase

---

## ✅ RESULTADO FINAL

### Tudo Funcionou?
- [ ] Conta criada ✅
- [ ] Onboarding completado ✅
- [ ] Plano criado ✅
- [ ] Sessão registrada ✅
- [ ] Dados no Supabase ✅
- [ ] Sincronização funcionando ✅

**🎉 PARABÉNS!** Seu YogaFlow está 100% integrado com Supabase!

### Algo Não Funcionou?
**Anote aqui:**
- Qual passo falhou?
- Qual foi o erro exato?
- O que apareceu no Console do navegador?

**Me envie essas informações e vou te ajudar a resolver!**

---

## 📊 Próximos Passos (Após Tudo Funcionar)

1. [ ] Limpar dados de teste
2. [ ] Fazer deploy para produção
3. [ ] Configurar domínio customizado
4. [ ] Adicionar analytics
5. [ ] Implementar funcionalidades avançadas

---

**Boa sorte com os testes! 🚀**
