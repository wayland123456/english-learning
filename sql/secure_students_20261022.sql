-- ============================================================
-- students 表安全加固（2026-10-22）
-- 背景：原实现把明文密码存在 password_hash 列，且 anon 可整表读写，
--       任何人拿出前端里的公开 key 就能拉走全部学生名单与密码。
-- 目标：密码永不出库；匿名端只能读白名单列、不能直接写表。
-- 配套：前端登录/注册/改密码/教师登录 全部改走 RPC 函数。
-- 执行位置：Supabase Dashboard → SQL Editor（整段粘贴执行一次）
-- ============================================================

begin;

-- ---------- 1. 收回匿名端对表的全部直接权限 ----------
-- 读取收窄到白名单列（password_hash 不在其中），写权限全部收回
revoke all on public.students from anon;

grant select (id, username, display_name, role, class_name, created_at)
  on public.students to anon;

-- ---------- 2. 登录校验：密码只在库内比对，前端拿不到哈希 ----------
create or replace function public.login_student(p_username text, p_password text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r json;
begin
  select json_build_object(
           'id',           s.id,
           'username',     s.username,
           'display_name', s.display_name,
           'role',         s.role,
           'class_name',   s.class_name)
    into r
  from public.students s
  where s.username = trim(p_username)
    and s.password_hash = p_password
  limit 1;

  return r;   -- 无匹配时返回 null
end;
$$;

-- ---------- 3. 注册：强制 role=student，防止注册成教师 ----------
create or replace function public.register_student(
  p_username text, p_password text, p_display_name text, p_class_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := trim(coalesce(p_username, ''));
  v_exists   text;
begin
  if v_username = '' or v_username !~ '^[A-Za-z0-9_]+$' then
    return json_build_object('ok', false, 'msg', '用户名只能包含字母、数字和下划线');
  end if;

  if length(coalesce(p_password, '')) < 1 then
    return json_build_object('ok', false, 'msg', '密码不能为空');
  end if;

  select s.username into v_exists
  from public.students s
  where s.username = v_username;

  if v_exists is not null then
    return json_build_object('ok', false, 'msg', '用户名已存在');
  end if;

  insert into public.students (username, password_hash, display_name, class_name, role)
  values (
    v_username,
    p_password,
    coalesce(nullif(trim(coalesce(p_display_name, '')), ''), v_username),
    p_class_name,
    'student'
  );

  return json_build_object('ok', true, 'msg', '注册成功');

exception
  when unique_violation then
    return json_build_object('ok', false, 'msg', '用户名已存在');
end;
$$;

-- ---------- 4. 修改密码：先验旧密码再更新 ----------
create or replace function public.change_password(
  p_username text, p_old text, p_new text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ok boolean;
begin
  select true into v_ok
  from public.students s
  where s.username = trim(p_username)
    and s.password_hash = p_old
  limit 1;

  if v_ok is not true then
    return json_build_object('ok', false, 'msg', '当前密码错误');
  end if;

  update public.students
     set password_hash = p_new
   where username = trim(p_username);

  return json_build_object('ok', true, 'msg', '密码修改成功');
end;
$$;

-- ---------- 5. 授权：只放行这三个函数 ----------
grant execute on function public.login_student(text, text)              to anon;
grant execute on function public.register_student(text, text, text, text) to anon;
grant execute on function public.change_password(text, text, text)      to anon;

commit;

-- ============================================================
-- 执行后自检（把下面两句单独选中运行，应当都报错/无权限）：
--   select * from students limit 1;                     -- 期望：permission denied for table students
--   select password_hash from students limit 1;         -- 期望：permission denied for table students
-- 若这两句还能查出数据，说明没生效，别急着让老师用。
-- ============================================================
