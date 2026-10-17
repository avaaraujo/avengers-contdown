-- Avengers Countdown: every object is prefixed avengers_ (this project hosts unrelated apps).

create table public.avengers_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.avengers_titles (
  id bigint generated always as identity primary key,
  slug text not null unique,
  kind text not null check (kind in ('main', 'finale', 'series', 'xmen')),
  chrono_order int not null,
  title_pt text not null,
  title_en text not null,
  release_year int,
  runtime_min int check (runtime_min > 0),
  phase int,
  director text,
  synopsis_pt text,
  tmdb_id int,
  comic_label text,
  comic_cover text,
  comic_source_url text,
  note text,
  created_at timestamptz not null default now(),
  unique (kind, chrono_order)
);

create table public.avengers_offers (
  id bigint generated always as identity primary key,
  title_id bigint not null references public.avengers_titles (id) on delete cascade,
  kind text not null check (kind in ('flatrate', 'free', 'ads', 'rent', 'buy')),
  provider_key text not null,
  provider_name text not null,
  logo_url text,
  price text,
  source text not null default 'justwatch',
  fetched_at timestamptz not null default now(),
  unique (title_id, kind, provider_key)
);

create table public.avengers_watches (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title_id bigint not null references public.avengers_titles (id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (user_id, title_id)
);
create index avengers_watches_title_id_idx on public.avengers_watches (title_id);

alter table public.avengers_config enable row level security;
alter table public.avengers_titles enable row level security;
alter table public.avengers_offers enable row level security;
alter table public.avengers_watches enable row level security;

-- public catalog: read-only for everyone; writes only through migrations / service role
create policy "avengers_config readable" on public.avengers_config for select to anon, authenticated using (true);
create policy "avengers_titles readable" on public.avengers_titles for select to anon, authenticated using (true);
create policy "avengers_offers readable" on public.avengers_offers for select to anon, authenticated using (true);

-- each person sees and changes only their own progress
create policy "avengers_watches own select" on public.avengers_watches for select to authenticated using ((select auth.uid()) = user_id);
create policy "avengers_watches own insert" on public.avengers_watches for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "avengers_watches own delete" on public.avengers_watches for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.avengers_config, public.avengers_titles, public.avengers_offers, public.avengers_watches from anon, authenticated;
grant select on public.avengers_config, public.avengers_titles, public.avengers_offers to anon, authenticated;
grant select, insert, delete on public.avengers_watches to authenticated;

insert into public.avengers_config (key, value) values
  ('premiere', '{"at": "2026-12-17T00:00:00-03:00", "title_pt": "Vingadores: Doutor Destino", "title_en": "Avengers: Doomsday", "country": "BR"}');
