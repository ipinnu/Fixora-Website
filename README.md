This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Future Plans

### Authentication (MVP → Clerk)

- **MVP:** Supabase email/password sign-up and login. Admin access is an email allowlist in `lib/admin.ts` (not role metadata in the database yet).
- **Later:** Migrate to [Clerk](https://clerk.com/) for auth (sessions, orgs, social providers). When that ships, remove the hardcoded admin allowlist and use Clerk roles or organization membership instead.

**Current admin emails** (must match Supabase accounts; `/admin` also requires RLS policies — run `supabase/patch-admin-emails.sql` on existing projects):

- `ipinnu.oladipo23@gmail.com`
- `fixoraglobalhub@gmail.com`

**Official contact:** `fixoraglobalhub@gmail.com` · `+234 811 281 8859`

### Social sign-in

- Google OAuth is intentionally not shown in the live product. Reintroduce after provider setup, or defer until the Clerk migration.
