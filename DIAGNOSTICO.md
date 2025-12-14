# 🔍 Diagnóstico - Por que os dados não estão subindo?

## 📋 Possíveis Causas

1. **Variáveis de ambiente não carregadas**
2. **Erro de autenticação**
3. **Políticas RLS bloqueando**
4. **Erro de rede**
5. **Tabelas não criadas corretamente**

---

## 🧪 TESTE 1: Verificar Console do Navegador

### Passo a Passo:
1. Abra `http://localhost:3000/`
2. Pressione **F12** para abrir DevTools
3. Vá na aba **Console**
4. Tente criar uma conta novamente
5. **Procure por erros em vermelho**

### O que procurar:
- ❌ `Missing Supabase environment variables`
- ❌ `Failed to fetch`
- ❌ `Network error`
- ❌ `Invalid API key`
- ❌ Qualquer erro relacionado a Supabase

**Me envie um print do Console se houver erros!**

---

## 🧪 TESTE 2: Verificar Aba Network

### Passo a Passo:
1. Com DevTools aberto (F12)
2. Vá na aba **Network**
3. Tente criar uma conta
4. Procure por requisições para `supabase.co`

### O que verificar:
- [ ] Há requisições para `https://rtuhrbndltaztgidsqgk.supabase.co`?
- [ ] Qual é o status? (200 = sucesso, 400/500 = erro)
- [ ] Clique na requisição e veja a resposta

**Status Code:**
- ✅ **200-299**: Sucesso
- ❌ **400**: Erro de validação
- ❌ **401**: Não autorizado (problema com API key)
- ❌ **403**: Proibido (problema com RLS)
- ❌ **500**: Erro no servidor

---

## 🧪 TESTE 3: Executar Script de Diagnóstico

### Opção A: No Console do Navegador

1. Abra `http://localhost:3000/`
2. Abra o Console (F12)
3. Cole este código e pressione Enter:

```javascript
// Verificar se Supabase está configurado
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'NÃO DEFINIDA');

// Testar conexão
import('./services/supabase.js').then(({ supabase }) => {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Conexão OK!');
    }
  });
});
```

### Opção B: Adicionar ao App.tsx temporariamente

Adicione no início do componente App:

```typescript
useEffect(() => {
  console.log('🔍 Verificando Supabase...');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'FALTANDO');
}, []);
```

---

## 🧪 TESTE 4: Verificar se .env está sendo lido

### Problema Comum: Vite não carrega .env

**Solução:**

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Reinicie:** `npm run dev`
3. **Tente novamente**

**Nota:** Vite só carrega variáveis `.env` ao iniciar!

---

## 🧪 TESTE 5: Verificar Supabase Dashboard

### A) Verificar Authentication

1. Vá em: https://app.supabase.com
2. Selecione seu projeto
3. **Authentication** → **Users**
4. Pergunta: **Há algum usuário criado?**

- ✅ **SIM**: A autenticação está funcionando, mas pode ser problema nas tabelas
- ❌ **NÃO**: O problema é na autenticação

### B) Verificar Tabelas

1. **Table Editor** → **profiles**
2. Pergunta: **A tabela existe?**

- ✅ **SIM**: Vá para próximo teste
- ❌ **NÃO**: Execute `supabase-migration-safe.sql` novamente

### C) Verificar Políticas RLS

1. **Table Editor** → **profiles**
2. Clique no ícone de **escudo** (RLS)
3. Pergunta: **RLS está habilitado?**
4. Pergunta: **Há políticas criadas?**

Deve ter:
- ✅ `Users can view own profile`
- ✅ `Users can insert own profile`
- ✅ `Users can update own profile`

---

## 🧪 TESTE 6: Testar Manualmente no Supabase

### Criar usuário direto no Dashboard:

1. **Authentication** → **Users** → **Add User**
2. Email: `manual@teste.com`
3. Password: `senha123`
4. Clique em **Create User**

### Depois, tente fazer login na aplicação:
- Email: `manual@teste.com`
- Senha: `senha123`

**Funcionou?**
- ✅ **SIM**: O problema é no signup, não no login
- ❌ **NÃO**: Há problema na autenticação geral

---

## 📊 Checklist de Diagnóstico

Marque o que você já verificou:

- [ ] Console do navegador (F12) - sem erros
- [ ] Aba Network - requisições para Supabase
- [ ] Variáveis .env estão corretas
- [ ] Servidor foi reiniciado após criar .env
- [ ] Tabelas existem no Supabase
- [ ] RLS está habilitado
- [ ] Políticas RLS foram criadas
- [ ] Usuário de teste manual funciona

---

## 🆘 Me Envie:

Para eu te ajudar melhor, me envie:

1. **Print do Console** (F12 → Console) quando tenta criar conta
2. **Print da aba Network** mostrando requisições
3. **Responda:**
   - Apareceu algum usuário no Supabase Authentication?
   - As tabelas existem no Table Editor?
   - RLS está habilitado?

---

**Vamos descobrir o problema juntos! 🔍**
