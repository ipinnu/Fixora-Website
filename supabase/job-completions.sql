-- Proof of work + admin payment release — run in Supabase SQL Editor after schema.sql

-- Allow proof_submitted status on transactions
alter table public.transactions drop constraint if exists transactions_status_check;
alter table public.transactions
  add constraint transactions_status_check
  check (status in ('pending', 'in_escrow', 'proof_submitted', 'paid', 'refunded'));

alter table public.transactions
  add column if not exists released_at timestamptz,
  add column if not exists admin_notes text;

create table if not exists public.job_completions (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references public.jobs(id) on delete cascade not null unique,
  bid_id          uuid references public.bids(id) on delete cascade not null,
  artisan_id      uuid references public.profiles(id) on delete cascade not null,
  transaction_id  uuid references public.transactions(id) on delete set null,
  notes           text,
  photo_urls      text[] default '{}',
  status          text default 'submitted'
    check (status in ('submitted', 'approved', 'rejected')),
  submitted_at    timestamptz default now(),
  reviewed_at     timestamptz,
  admin_notes     text
);

alter table public.job_completions enable row level security;

create policy "completions: artisan insert own"
  on public.job_completions for insert
  with check (auth.uid() = artisan_id);

create policy "completions: artisan update own rejected"
  on public.job_completions for update
  using (auth.uid() = artisan_id and status = 'rejected');

create policy "completions: participant read"
  on public.job_completions for select
  using (
    auth.uid() = artisan_id
    or auth.uid() in (select customer_id from public.jobs where id = job_id)
    or (auth.jwt() ->> 'email') in (
      'ipinnu.oladipo23@gmail.com',
      'fixoraglobalhub@gmail.com'
    )
  );

create policy "completions: admin update"
  on public.job_completions for update
  using ((auth.jwt() ->> 'email') in (
    'ipinnu.oladipo23@gmail.com',
    'fixoraglobalhub@gmail.com'
  ));

create policy "transactions: customer insert"
  on public.transactions for insert
  with check (auth.uid() = customer_id);

create policy "transactions: admin update"
  on public.transactions for update
  using ((auth.jwt() ->> 'email') in (
    'ipinnu.oladipo23@gmail.com',
    'fixoraglobalhub@gmail.com'
  ));

-- Storage for completion photos
insert into storage.buckets (id, name, public)
values ('job-completion-photos', 'job-completion-photos', true)
on conflict (id) do nothing;

create policy "job-completion-photos: artisan upload"
  on storage.objects for insert
  with check (
    bucket_id = 'job-completion-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "job-completion-photos: public read"
  on storage.objects for select
  using (bucket_id = 'job-completion-photos');
