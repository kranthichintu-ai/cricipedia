# Supabase setup

## 1. Apply the migration

Create a Supabase project, then run `migrations/20261003000100_crikipedia_backend.sql` in the project's SQL Editor. The migration is additive: player seeds use `ON CONFLICT DO NOTHING`, and existing app data is not deleted. Statistics are seeded only where verified values are present; unknown values remain `NULL` and render as `N/A`.

The migration creates a public `player-images` Storage bucket. Public users may read images from that bucket; uploads, updates, and deletes require the database-backed `admin` role.

## 2. Configure the browser client

Copy the Project URL and publishable/anon key from Supabase Project Settings → API into `supabase-config.js`:

```js
window.CRICKET_SUPABASE_CONFIG = Object.freeze({
    url: 'https://YOUR_PROJECT_REF.supabase.co',
    anonKey: 'YOUR_PUBLIC_ANON_KEY'
});
```

The anon/publishable key is intended for browser use and is restricted by the migration's RLS policies. Never put the service-role key in this file or any browser-delivered asset. Until configured, the site retains its local player directory and browser-local favourites; server-backed authentication and data operations report that configuration is required.

## 3. Configure authentication URLs

In Authentication → URL Configuration, set the local development URL and the production site's URL as allowed redirect URLs. Enable email confirmations and configure SMTP in Supabase if you need reliable verification and password-reset delivery.

## 4. Promote the first administrator

1. Register and verify the account through Crikipedia.
2. Find its UUID in Authentication → Users.
3. Run this in the SQL Editor, replacing the UUID with that account's ID:

```sql
update public.profiles
set role = 'admin'
where id = '00000000-0000-4000-8000-000000000000';
```

Role changes are intentionally unavailable to regular users and the browser profile editor. RLS and `public.is_admin()` enforce administrator privileges at the database.

## 5. Verify deployment

Apply the migration to a non-production project first. Then test anonymous player/stat reads, account registration and confirmation, per-user favourites, admin CRUD, and image upload under separate admin and ordinary-user accounts. The repository currently has no Supabase project credentials or local PostgreSQL/Supabase CLI, so live database migration and RLS tests must be run after project setup.
