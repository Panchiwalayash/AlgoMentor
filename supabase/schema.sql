-- ==============================================================================
-- AlgoMentor Supabase Schema: Persistent Conversations & Auth Integration
-- ==============================================================================

-- 1. Profiles table to store public student information (username, avatar, etc.)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enhanced Conversations table for persistent DSA practice sessions
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_email text,
  user_name text,
  topic_id text not null,
  session_day int default 1,
  messages jsonb not null,
  summary text,
  created_at timestamptz default now()
);

-- Ensure columns exist even if table was previously created with minimal schema
alter table conversations add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table conversations add column if not exists user_email text;
alter table conversations add column if not exists user_name text;
alter table conversations add column if not exists summary text;

-- Indexes for lightning-fast queries by user, topic, and chronological order
create index if not exists idx_conversations_user_topic
  on conversations (user_id, topic_id, created_at desc);

create index if not exists idx_conversations_topic_created
  on conversations (topic_id, created_at desc);

create index if not exists idx_conversations_user_created
  on conversations (user_id, created_at desc);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table conversations enable row level security;

-- Profiles Policies:
drop policy if exists "Profiles are viewable by authenticated users" on profiles;
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (true);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Conversations Policies:
drop policy if exists "Allow insert for authenticated and anon" on conversations;
drop policy if exists "Users can view their own conversations" on conversations;
create policy "Users can view their own conversations"
  on conversations for select
  using (
    auth.uid() = user_id or user_id is null
  );

drop policy if exists "Users can insert conversations" on conversations;
create policy "Users can insert conversations"
  on conversations for insert
  with check (
    auth.uid() = user_id or user_id is null
  );

drop policy if exists "Users can delete their own conversations" on conversations;
create policy "Users can delete their own conversations"
  on conversations for delete
  using (
    auth.uid() = user_id
  );

-- Function and trigger to auto-create profile on Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run handle_new_user on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
