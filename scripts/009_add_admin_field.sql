-- 添加 is_admin 字段到 profiles 表
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;

-- 给 admin@dogisok.net 设为管理员
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@dogisok.net';
