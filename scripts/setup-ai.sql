-- 创建 ai_config 表（存储 AI 配置）
create table if not exists public.ai_config (
  id bigserial primary key,
  key text not null unique,
  api_key text not null,
  base_url text not null default 'https://api.deepseek.com',
  system_prompt text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建 ai_conversations 表（可选，用于记录对话历史）
create table if not exists public.ai_conversations (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  user_message text not null,
  assistant_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 创建索引
create index if not exists ai_conversations_user_id_idx on public.ai_conversations(user_id);
create index if not exists ai_conversations_created_at_idx on public.ai_conversations(created_at);

-- 设置 RLS 策略
alter table public.ai_config enable row level security;
alter table public.ai_conversations enable row level security;

-- ai_config 只允许管理员读写
create policy ai_config_admin_only on public.ai_config
  for all using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- ai_conversations 用户只能读写自己的
create policy ai_conversations_user_own on public.ai_conversations
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
