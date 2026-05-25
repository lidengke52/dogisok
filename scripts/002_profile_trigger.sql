-- 生成 8 位大写字母数字邀请码
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text := '';
  i int := 0;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
  end loop;
  return result;
end;
$$;

-- 新用户自动创建 profile（含唯一邀请码 + 邀请关系绑定）
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  inviter_id uuid;
  entered_code text;
begin
  -- 尝试生成唯一邀请码（最多重试 5 次）
  for i in 1..5 loop
    new_code := public.generate_invite_code();
    exit when not exists (select 1 from public.profiles where invite_code = new_code);
  end loop;

  -- 读取注册时填写的邀请码（如果有）
  entered_code := nullif(new.raw_user_meta_data ->> 'invite_code', '');
  if entered_code is not null then
    select id into inviter_id from public.profiles where invite_code = upper(entered_code);
  end if;

  insert into public.profiles (id, display_name, pet_name, pet_breed, invite_code, invited_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'pet_name', null),
    coalesce(new.raw_user_meta_data ->> 'pet_breed', null),
    new_code,
    inviter_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
