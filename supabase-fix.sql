-- ⚠️ ATENÇÃO: Este script e limpa as tabelas de artigos anteriores para corrigir erros.

-- 1. Limpar tabelas antigas para evitar conflitos
DROP TABLE IF EXISTS article_likes;

DROP TABLE IF EXISTS article_comments;

DROP TABLE IF EXISTS articles;

-- 2. Criar tabela de Artigos do zero
create table articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  read_time text,
  author text,
  image_url text,
  excerpt text,
  content text[] not null,
  likes integer default 0,
  is_user_generated boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table articles enable row level security;

-- Políticas de acesso para Artigos
create policy "Public_read_articles" on articles for
select using (true);

create policy "User_insert_articles" on articles for
insert
with
    check (auth.uid () = user_id);

create policy "User_delete_articles" on articles for delete using (
    auth.uid () = user_id
    OR (
        select email
        from auth.users
        where
            id = auth.uid ()
    ) like 'admin%'
);

-- 3. Criar tabela de Comentários
create table article_comments (
    id uuid default gen_random_uuid () primary key,
    article_id uuid references articles (id) on delete cascade,
    user_id uuid references auth.users (id),
    user_name text,
    text text not null,
    likes integer default 0,
    created_at timestamptz default now()
);

alter table article_comments enable row level security;

-- Políticas de acesso para Comentários
create policy "Public_read_comments" on article_comments for
select using (true);

create policy "User_insert_comments" on article_comments for
insert
with
    check (auth.uid () = user_id);

create policy "User_delete_comments" on article_comments for delete using (
    auth.uid () = user_id
    OR (
        select email
        from auth.users
        where
            id = auth.uid ()
    ) like 'admin%'
);

-- 4. Criar tabela de Likes
create table article_likes (
    user_id uuid references auth.users (id),
    article_id uuid references articles (id) on delete cascade,
    created_at timestamptz default now(),
    primary key (user_id, article_id)
);

alter table article_likes enable row level security;

-- Políticas de acesso para Likes
create policy "Public_read_likes" on article_likes for
select using (true);

create policy "User_insert_likes" on article_likes for
insert
with
    check (auth.uid () = user_id);

create policy "User_delete_likes" on article_likes for delete using (auth.uid () = user_id);