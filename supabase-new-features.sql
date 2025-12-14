-- Create Articles Table
create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  read_time text,
  author text,
  image_url text,
  excerpt text,
  content text[] not null, -- Array of paragraphs
  likes integer default 0,
  is_user_generated boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS for Articles
alter table articles enable row level security;

-- Policies for Articles
create policy "Public articles are viewable by everyone" on articles for
select using (true);

create policy "Users can insert their own articles" on articles for
insert
with
    check (auth.uid () = user_id);

-- Simplistic admin check for demo purposes (email starts with admin)
-- Note: In production, specific roles should be used.
create policy "Admins can delete any article" on articles for delete using (
    auth.uid () = user_id
    OR (
        select email
        from auth.users
        where
            id = auth.uid ()
    ) like 'admin%'
);

-- Create Comments Table (simplified structure)
create table if not exists article_comments (
    id uuid default gen_random_uuid () primary key,
    article_id uuid references articles (id) on delete cascade,
    user_id uuid references auth.users (id),
    user_name text, -- Denormalized for simpler display
    text text not null,
    likes integer default 0,
    created_at timestamptz default now()
);

alter table article_comments enable row level security;

create policy "Comments viewable by everyone" on article_comments for
select using (true);

create policy "Authenticated users can comment" on article_comments for
insert
with
    check (auth.uid () = user_id);

create policy "Users can delete own comments or admins" on article_comments for delete using (
    auth.uid () = user_id
    OR (
        select email
        from auth.users
        where
            id = auth.uid ()
    ) like 'admin%'
);

-- Likes table (Many-to-Many to track who liked what)
create table if not exists article_likes (
    user_id uuid references auth.users (id),
    article_id uuid references articles (id) on delete cascade,
    created_at timestamptz default now(),
    primary key (user_id, article_id)
);

alter table article_likes enable row level security;

create policy "Public view likes" on article_likes for
select using (true);

create policy "User can like" on article_likes for
insert
with
    check (auth.uid () = user_id);

create policy "User can unlike" on article_likes for delete using (auth.uid () = user_id);

check (auth.uid () = user_id);

create policy "User can unlike" on article_likes for delete using (auth.uid () = user_id);