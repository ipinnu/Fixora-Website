-- Artisan verification — run in Supabase SQL Editor after schema.sql
-- Manual admin review of NIN + ID image + face photo

alter table public.profiles
  add column if not exists verification_status text default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected'));

alter table public.profiles
  add column if not exists bio text,
  add column if not exists years_experience text,
  add column if not exists daily_rate numeric,
  add column if not exists service_states text[],
  add column if not exists languages text[];

create table if not exists public.artisan_verifications (
  id                uuid primary key default gen_random_uuid(),
  artisan_id        uuid references public.profiles(id) on delete cascade not null unique,
  nin               text not null,
  id_document_url   text not null,
  face_photo_url    text,
  status            text default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  trade             text,
  years_experience  text,
  bio               text,
  service_states    text[],
  daily_rate        numeric,
  languages         text[],
  admin_notes       text,
  submitted_at      timestamptz default now(),
  reviewed_at       timestamptz
);

alter table public.artisan_verifications enable row level security;

create policy "verifications: artisan insert own"
  on public.artisan_verifications for insert
  with check (auth.uid() = artisan_id);

create policy "verifications: artisan read own"
  on public.artisan_verifications for select
  using (auth.uid() = artisan_id);

create policy "verifications: authenticated read"
  on public.artisan_verifications for select
  using (auth.role() = 'authenticated');

create policy "verifications: admin update"
  on public.artisan_verifications for update
  using ((auth.jwt() ->> 'email') in (
    'ipinnu.oladipo23@gmail.com',
    'fixoraglobalhub@gmail.com'
  ));

-- Storage bucket for ID and face images (public read for admin review UI)
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', true)
on conflict (id) do nothing;

create policy "verification-docs: artisan upload"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "verification-docs: public read"
  on storage.objects for select
  using (bucket_id = 'verification-docs');
