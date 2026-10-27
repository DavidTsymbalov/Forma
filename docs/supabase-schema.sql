-- Forma — шаг 1: схема БД (Email auth)
-- Вставь целиком в Supabase → SQL Editor → Run

-- Профили (1:1 с auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Папки проектов
create table if not exists public.project_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_folders_user_id_idx
  on public.project_folders (user_id, sort);

-- Чаты внутри папок
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  folder_id uuid not null references public.project_folders (id) on delete cascade,
  title text not null default 'New chat',
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chats_folder_id_idx
  on public.chats (folder_id, created_at desc);

create index if not exists chats_user_id_idx
  on public.chats (user_id);

-- Автопрофиль при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url, plan)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      'User'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    'free'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists project_folders_set_updated_at on public.project_folders;
create trigger project_folders_set_updated_at
  before update on public.project_folders
  for each row execute function public.set_updated_at();

drop trigger if exists chats_set_updated_at on public.chats;
create trigger chats_set_updated_at
  before update on public.chats
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.project_folders enable row level security;
alter table public.chats enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- project_folders
drop policy if exists "folders_select_own" on public.project_folders;
create policy "folders_select_own"
  on public.project_folders for select
  using (auth.uid() = user_id);

drop policy if exists "folders_insert_own" on public.project_folders;
create policy "folders_insert_own"
  on public.project_folders for insert
  with check (auth.uid() = user_id);

drop policy if exists "folders_update_own" on public.project_folders;
create policy "folders_update_own"
  on public.project_folders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "folders_delete_own" on public.project_folders;
create policy "folders_delete_own"
  on public.project_folders for delete
  using (auth.uid() = user_id);

-- chats
drop policy if exists "chats_select_own" on public.chats;
create policy "chats_select_own"
  on public.chats for select
  using (auth.uid() = user_id);

drop policy if exists "chats_insert_own" on public.chats;
create policy "chats_insert_own"
  on public.chats for insert
  with check (auth.uid() = user_id);

drop policy if exists "chats_update_own" on public.chats;
create policy "chats_update_own"
  on public.chats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "chats_delete_own" on public.chats;
create policy "chats_delete_own"
  on public.chats for delete
  using (auth.uid() = user_id);
