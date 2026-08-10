# Going live — runbook

Follow these steps in order. Steps 1–2 (creating accounts) you can do anytime;
everything else needs those accounts first.

## 1. Supabase project
Already done if you followed the earlier instructions. If not: supabase.com →
New Project → save the DB password → wait for it to finish provisioning.

## 2. Cloudinary account
Already done if you followed the earlier instructions. If not: cloudinary.com
→ Sign up → your Cloud Name / API Key / API Secret are on the dashboard home.

## 3. Run the database schema
In the Supabase Dashboard → **SQL Editor** → **New query**:
1. Paste the entire contents of `supabase/migrations/0001_init.sql`, run it.
2. Paste the entire contents of `supabase/migrations/0002_seed.sql`, run it.

This creates every table, security rule, and starter content (your 4 services,
homepage layout, legal pages). It deliberately does **not** add fake portfolio
projects or testimonials — you'll add your real ones through the admin panel.

## 4. Create your admin login
1. Supabase Dashboard → **Authentication → Users → Add user**. Use your real
   email and a strong password. Leave "Auto Confirm User" checked.
2. Copy the new user's UUID from the users list.
3. Back in **SQL Editor**, run (replace the UUID and your name):
   ```sql
   insert into admin_profiles (user_id, full_name, role)
   values ('paste-the-uuid-here', 'Your Name', 'owner');
   ```
4. This email/password is what you'll use to sign in at `/admin/login` — this
   is now a REAL login, no one else can get in without it.

## 5. Fill in `.env.local`
Open `.env.local` in the project and replace the placeholder values with your
real ones:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Project Settings → API.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard.
- `NEXT_PUBLIC_SITE_URL` — your real domain once you have one (e.g.
  `https://3stardecoration.com`); leave as localhost until then.

Restart `npm run dev` after saving — you should be able to sign in at
`/admin/login` with the email/password from step 4.

## 6. Add your real content, before opening the site publicly
Log into `/admin` and, in this order:
1. **Media Library** — upload your real event photos.
2. **Portfolio** — add your real completed events, attach photos, mark the
   best ones "Featured on homepage," publish them.
3. **Testimonials** — add your real client quotes (with their OK to publish).
4. **Services** — attach a real cover photo to each of the 4 services.
5. **Homepage** — pick real photos for Before & After, the Testimonials
   background, and the Instagram wall (or turn a section off there if you're
   not ready with content for it yet — every section has a toggle).
6. **Settings** — your real phone, WhatsApp number, email, address, and
   social links.

## 7. Deploy to Vercel
1. vercel.com → New Project → import this GitHub repo (push it to GitHub
   first if it isn't already — say the word and I'll do that with you).
2. In the Vercel project's **Settings → Environment Variables**, add every
   variable from `.env.local` (same names, same values).
3. **Settings → General → Node.js Version** → set to **22.x**.
4. Deploy. Vercel gives you a `*.vercel.app` URL immediately — check the live
   site and `/admin/login` there before pointing your real domain at it.
5. Once it looks right: **Settings → Domains** → add your real domain, follow
   Vercel's DNS instructions, then update `NEXT_PUBLIC_SITE_URL` (in both
   `.env.local` and Vercel's env vars) to the real domain and redeploy.

## 8. Last check before sharing the link publicly
- Visit `/privacy` and `/terms` — the text there is generic starter copy
  (flagged in the seed file). Have it reviewed, or ask me to adjust it.
- Submit a test enquiry through `/quote` yourself and confirm it shows up in
  `/admin/enquiries`.
- Try logging into `/admin` from a different browser/incognito window without
  the password — confirm you're bounced to the login page.
