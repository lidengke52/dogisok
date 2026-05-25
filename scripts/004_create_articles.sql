-- 文章表（CMS 管理）
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  cover_image text,
  category text not null,
  author text not null default 'Dog is OK Editorial',
  read_time integer not null default 5,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_category_idx on public.articles(category);
create index if not exists articles_published_idx on public.articles(published);
create index if not exists articles_created_at_idx on public.articles(created_at desc);

alter table public.articles enable row level security;

drop policy if exists "articles_public_read" on public.articles;
drop policy if exists "articles_admin_write" on public.articles;

-- 已发布的文章对所有人可读
create policy "articles_public_read"
  on public.articles for select
  using (published = true);

-- 管理员（user_metadata.is_admin = true）可以增删改
create policy "articles_admin_write"
  on public.articles for all
  using (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
  )
  with check (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
  );
