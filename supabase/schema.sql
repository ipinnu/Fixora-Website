-- ============================================================
-- FIXORA — Full Schema
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  role        text check (role in ('customer', 'artisan')),
  trade       text,
  state       text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, trade, state)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'trade',
    new.raw_user_meta_data->>'state'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── Jobs ────────────────────────────────────────────────────
create table if not exists public.jobs (
  id            uuid default gen_random_uuid() primary key,
  customer_id   uuid references public.profiles(id) on delete set null,
  title         text not null,
  category      text not null,
  state         text not null,
  lga           text,
  description   text,
  timeline      text,
  budget_amount numeric,
  status        text default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  created_at    timestamptz default now()
);

-- ── Job Photos ───────────────────────────────────────────────
create table if not exists public.job_photos (
  id         uuid default gen_random_uuid() primary key,
  job_id     uuid references public.jobs(id) on delete cascade,
  url        text not null,
  created_at timestamptz default now()
);

-- ── Bids ────────────────────────────────────────────────────
create table if not exists public.bids (
  id          uuid default gen_random_uuid() primary key,
  job_id      uuid references public.jobs(id) on delete cascade,
  artisan_id  uuid references public.profiles(id) on delete cascade,
  amount      numeric not null,
  message     text,
  status      text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at  timestamptz default now(),
  unique (job_id, artisan_id)
);

-- ── Notifications ────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  type       text not null,  -- 'new_job' | 'bid_received' | 'bid_accepted' | 'bid_declined'
  title      text not null,
  body       text,
  data       jsonb default '{}',
  read       boolean default false,
  created_at timestamptz default now()
);

-- Index for fast unread lookups
create index if not exists notifications_user_unread
  on public.notifications(user_id, read, created_at desc);


-- ── Trigger: notify matching artisans on new job ─────────────
create or replace function public.notify_matching_artisans()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, body, data)
  select
    p.id,
    'new_job',
    'New job: ' || NEW.title,
    NEW.category || ' · ' || NEW.state || coalesce(', ' || nullif(NEW.lga, ''), ''),
    jsonb_build_object(
      'job_id',   NEW.id,
      'category', NEW.category,
      'state',    NEW.state,
      'budget',   NEW.budget_amount
    )
  from public.profiles p
  where p.role = 'artisan'
    and (
      lower(p.trade) = lower(NEW.category)
      or lower(p.trade) like '%' || lower(NEW.category) || '%'
      or lower(NEW.category) like '%' || lower(p.trade) || '%'
    )
    and (p.state = NEW.state or p.state is null or p.state = '');

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_job_created on public.jobs;
create trigger on_job_created
  after insert on public.jobs
  for each row execute function public.notify_matching_artisans();


-- ── Trigger: notify customer when bid is received ────────────
create or replace function public.notify_bid_received()
returns trigger as $$
declare
  v_job     public.jobs%rowtype;
  v_artisan public.profiles%rowtype;
begin
  select * into v_job     from public.jobs     where id = NEW.job_id;
  select * into v_artisan from public.profiles where id = NEW.artisan_id;

  if v_job.customer_id is not null then
    insert into public.notifications (user_id, type, title, body, data)
    values (
      v_job.customer_id,
      'bid_received',
      coalesce(v_artisan.full_name, 'An artisan') || ' submitted a bid',
      v_job.title || ' · ₦' || NEW.amount::text,
      jsonb_build_object('job_id', NEW.job_id, 'bid_id', NEW.id)
    );
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_bid_created on public.bids;
create trigger on_bid_created
  after insert on public.bids
  for each row execute function public.notify_bid_received();


-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.jobs         enable row level security;
alter table public.job_photos   enable row level security;
alter table public.bids         enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "profiles: public read"
  on public.profiles for select using (true);
create policy "profiles: own update"
  on public.profiles for update using (auth.uid() = id);

-- Jobs
create policy "jobs: public read"
  on public.jobs for select using (true);
create policy "jobs: authenticated insert"
  on public.jobs for insert with check (true);
create policy "jobs: owner update"
  on public.jobs for update using (auth.uid() = customer_id);

-- Job photos
create policy "job_photos: public read"
  on public.job_photos for select using (true);
create policy "job_photos: authenticated insert"
  on public.job_photos for insert with check (true);

-- Bids
create policy "bids: public read"
  on public.bids for select using (true);
create policy "bids: artisan insert"
  on public.bids for insert with check (auth.uid() = artisan_id);
create policy "bids: artisan/customer update"
  on public.bids for update using (
    auth.uid() = artisan_id or
    auth.uid() = (select customer_id from public.jobs where id = job_id)
  );

-- Notifications — strictly personal
create policy "notifications: own read"
  on public.notifications for select using (auth.uid() = user_id);
create policy "notifications: own update"
  on public.notifications for update using (auth.uid() = user_id);


-- ── Messages ─────────────────────────────────────────────────
create table if not exists public.messages (
  id          uuid default gen_random_uuid() primary key,
  job_id      uuid references public.jobs(id) on delete cascade,
  sender_id   uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  body        text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

create index if not exists messages_job_id on public.messages(job_id, created_at);

alter table public.messages enable row level security;
create policy "messages: participants only"
  on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages: sender insert"
  on public.messages for insert with check (auth.uid() = sender_id);
create policy "messages: receiver update (mark read)"
  on public.messages for update using (auth.uid() = receiver_id);


-- ── Reviews ───────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid default gen_random_uuid() primary key,
  artisan_id  uuid references public.profiles(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete cascade,
  job_id      uuid references public.jobs(id) on delete set null,
  rating      integer check (rating between 1 and 5) not null,
  comment     text,
  created_at  timestamptz default now(),
  unique (job_id, reviewer_id)
);

alter table public.reviews enable row level security;
create policy "reviews: public read"
  on public.reviews for select using (true);
create policy "reviews: reviewer insert"
  on public.reviews for insert with check (auth.uid() = reviewer_id);


-- ── Transactions ──────────────────────────────────────────────
create table if not exists public.transactions (
  id          uuid default gen_random_uuid() primary key,
  bid_id      uuid references public.bids(id) on delete set null,
  job_id      uuid references public.jobs(id) on delete set null,
  customer_id uuid references public.profiles(id) on delete set null,
  artisan_id  uuid references public.profiles(id) on delete set null,
  amount      numeric not null,
  reference   text not null unique,
  status      text default 'pending' check (status in ('pending','in_escrow','paid','refunded')),
  created_at  timestamptz default now()
);

alter table public.transactions enable row level security;
create policy "transactions: own read"
  on public.transactions for select using (auth.uid() = customer_id or auth.uid() = artisan_id);


-- ── Realtime: enable for notifications + messages ────────────
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.jobs;
alter publication supabase_realtime add table public.messages;
