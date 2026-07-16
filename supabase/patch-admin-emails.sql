-- Run once in Supabase SQL Editor if policies were already applied with a single admin email.

drop policy if exists "verifications: admin update" on public.artisan_verifications;
create policy "verifications: admin update"
  on public.artisan_verifications for update
  using ((auth.jwt() ->> 'email') in (
    'ipinnu.oladipo23@gmail.com',
    'fixoraglobalhub@gmail.com'
  ));

drop policy if exists "completions: participant read" on public.job_completions;
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

drop policy if exists "completions: admin update" on public.job_completions;
create policy "completions: admin update"
  on public.job_completions for update
  using ((auth.jwt() ->> 'email') in (
    'ipinnu.oladipo23@gmail.com',
    'fixoraglobalhub@gmail.com'
  ));

drop policy if exists "transactions: admin update" on public.transactions;
create policy "transactions: admin update"
  on public.transactions for update
  using ((auth.jwt() ->> 'email') in (
    'ipinnu.oladipo23@gmail.com',
    'fixoraglobalhub@gmail.com'
  ));
