-- 查询当前用户成功邀请的人数（仅返回计数，不暴露被邀请者信息）
create or replace function public.get_invite_count(user_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.profiles
  where invited_by = user_id;
$$;

grant execute on function public.get_invite_count(uuid) to authenticated;

-- 获取当前用户邀请的用户列表（脱敏：仅显示昵称缩写和注册时间）
create or replace function public.get_my_invitees()
returns table (
  masked_name text,
  joined_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    case
      when length(coalesce(display_name, '')) > 0
        then substr(display_name, 1, 1) || '***'
      else 'User'
    end as masked_name,
    created_at as joined_at
  from public.profiles
  where invited_by = auth.uid()
  order by created_at desc;
$$;

grant execute on function public.get_my_invitees() to authenticated;
