create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null,
  session_day int default 1,
  messages jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_conversations_topic_created
  on conversations (topic_id, created_at desc);

alter table conversations enable row level security;

create policy "Allow insert for authenticated and anon"
  on conversations for insert
  with check (true);
