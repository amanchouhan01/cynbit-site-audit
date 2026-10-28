-- Run once in the Supabase SQL editor.
create table if not exists audit_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  name text,
  audited_url text not null,
  strategy text not null check (strategy in ('mobile', 'desktop')),
  scores jsonb not null
);

create table if not exists audit_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  host text not null,
  strategy text not null,
  scores jsonb not null,
  duration_ms integer not null
);

-- RLS on with no policies: only the server's service-role key can read or write.
alter table audit_leads enable row level security;
alter table audit_runs enable row level security;

create index if not exists audit_leads_created_idx on audit_leads (created_at desc);
