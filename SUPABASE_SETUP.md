# Configuração do Supabase - YogaFlow

## 🚀 Passos para Configurar

### 1. Executar o Script de Perfis (✅ Concluído)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto: `rtuhrbndltaztgidsqgk`
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase-setup.sql`
6. Clique em **Run** para executar o script

### 2. Executar o Script de Tabelas Principais

1. No **SQL Editor**, clique em **New Query** novamente
2. Copie e cole o conteúdo do arquivo `supabase-tables.sql`
3. Clique em **Run** para executar o script
4. Aguarde a confirmação de sucesso

### 3. Verificar as Tabelas Criadas

Após executar o script, você deve ter:

- ✅ Tabela `profiles` com os campos:
  - `id` (UUID, referência ao usuário do Auth)
  - `name` (TEXT)
  - `email` (TEXT)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

### 3. Políticas de Segurança (RLS)

O script já configurou as políticas de Row Level Security (RLS):

- Usuários podem **ver** apenas seu próprio perfil
- Usuários podem **atualizar** apenas seu próprio perfil
- Usuários podem **inserir** apenas seu próprio perfil

### 4. Configuração do Email (Opcional)

Para habilitar o envio de emails de confirmação:

1. Vá em **Authentication** → **Email Templates**
2. Configure os templates de email conforme necessário
3. Em **Authentication** → **Settings**, você pode:
   - Desabilitar confirmação de email (para desenvolvimento)
   - Configurar provedores de email (SendGrid, etc.)

### 5. Testar a Autenticação

1. Execute `npm run dev` no terminal
2. Acesse a aplicação
3. Tente criar uma nova conta
4. Verifique no Supabase Dashboard em **Authentication** → **Users** se o usuário foi criado
5. Verifique na tabela `profiles` se o perfil foi criado

## 🔑 Variáveis de Ambiente

As seguintes variáveis já estão configuradas no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://rtuhrbndltaztgidsqgk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Próximos Passos

Após configurar o Supabase, você pode:

1. **Migrar dados de localStorage**: Criar um script para migrar dados existentes
2. **Adicionar mais tabelas**: Para histórico de sessões, planos de treino, etc.
3. **Configurar Storage**: Para armazenar imagens de poses
4. **Adicionar Real-time**: Para sincronização em tempo real

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
