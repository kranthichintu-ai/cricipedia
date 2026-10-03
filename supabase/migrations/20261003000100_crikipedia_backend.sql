create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text,
    email text,
    avatar_url text,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);

create table if not exists public.players (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    full_name text not null,
    country text not null,
    birth_date date,
    playing_role text not null,
    batting_style text,
    bowling_style text,
    image_url text,
    biography text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.player_statistics (
    id uuid primary key default gen_random_uuid(),
    player_id uuid not null references public.players (id) on delete cascade,
    format text not null check (format in ('Test', 'ODI', 'T20I')),
    matches integer check (matches is null or matches >= 0),
    innings integer check (innings is null or innings >= 0),
    runs integer check (runs is null or runs >= 0),
    highest_score text,
    batting_average numeric(8, 2) check (batting_average is null or batting_average >= 0),
    strike_rate numeric(8, 2) check (strike_rate is null or strike_rate >= 0),
    centuries integer check (centuries is null or centuries >= 0),
    half_centuries integer check (half_centuries is null or half_centuries >= 0),
    fours integer check (fours is null or fours >= 0),
    sixes integer check (sixes is null or sixes >= 0),
    wickets integer check (wickets is null or wickets >= 0),
    bowling_average numeric(8, 2) check (bowling_average is null or bowling_average >= 0),
    economy numeric(8, 2) check (economy is null or economy >= 0),
    bowling_strike_rate numeric(8, 2) check (bowling_strike_rate is null or bowling_strike_rate >= 0),
    best_bowling text,
    five_wicket_hauls integer check (five_wicket_hauls is null or five_wicket_hauls >= 0),
    ten_wicket_hauls integer check (ten_wicket_hauls is null or ten_wicket_hauls >= 0),
    source_url text,
    source_kind text not null default 'manual' check (source_kind in ('verified_import', 'manual')),
    verified_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (player_id, format)
);

create table if not exists public.favourites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    player_id uuid not null references public.players (id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (user_id, player_id)
);

create index if not exists players_active_name_idx on public.players (is_active, full_name);
create index if not exists player_statistics_player_format_idx on public.player_statistics (player_id, format);
create index if not exists favourites_user_created_idx on public.favourites (user_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
          and role = 'admin'
    );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create trigger player_statistics_set_updated_at
before update on public.player_statistics
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name, email)
    values (
        new.id,
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        new.email
    )
    on conflict (id) do update set email = excluded.email;
    return new;
end;
$$;

create trigger on_auth_user_created
 after insert on auth.users
 for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.player_statistics enable row level security;
alter table public.favourites enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
create policy profiles_read_self_or_admin
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_self
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke all on public.players from anon, authenticated;
grant select on public.players to anon, authenticated;
grant insert, update, delete on public.players to authenticated;
create policy players_read_active
on public.players for select to anon, authenticated
using (is_active = true);
create policy players_admin_read_all
on public.players for select to authenticated
using (public.is_admin());
create policy players_admin_insert
on public.players for insert to authenticated
with check (public.is_admin());
create policy players_admin_update
on public.players for update to authenticated
using (public.is_admin())
with check (public.is_admin());
create policy players_admin_delete
on public.players for delete to authenticated
using (public.is_admin());

revoke all on public.player_statistics from anon, authenticated;
grant select on public.player_statistics to anon, authenticated;
grant insert, update, delete on public.player_statistics to authenticated;
create policy player_statistics_read_active_players
on public.player_statistics for select to anon, authenticated
using (
    exists (
        select 1
        from public.players
        where players.id = player_statistics.player_id
          and players.is_active = true
    )
);
create policy player_statistics_admin_read_all
on public.player_statistics for select to authenticated
using (public.is_admin());
create policy player_statistics_admin_insert
on public.player_statistics for insert to authenticated
with check (public.is_admin());
create policy player_statistics_admin_update
on public.player_statistics for update to authenticated
using (public.is_admin())
with check (public.is_admin());
create policy player_statistics_admin_delete
on public.player_statistics for delete to authenticated
using (public.is_admin());

revoke all on public.favourites from anon, authenticated;
grant select, insert, delete on public.favourites to authenticated;
create policy favourites_read_own
on public.favourites for select to authenticated
using (user_id = (select auth.uid()));
create policy favourites_insert_own
on public.favourites for insert to authenticated
with check (user_id = (select auth.uid()));
create policy favourites_delete_own
on public.favourites for delete to authenticated
using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('player-images', 'player-images', true)
on conflict (id) do nothing;

create policy player_images_public_read
on storage.objects for select to public
using (bucket_id = 'player-images');
create policy player_images_admin_insert
on storage.objects for insert to authenticated
with check (bucket_id = 'player-images' and public.is_admin());
create policy player_images_admin_update
on storage.objects for update to authenticated
using (bucket_id = 'player-images' and public.is_admin())
with check (bucket_id = 'player-images' and public.is_admin());
create policy player_images_admin_delete
on storage.objects for delete to authenticated
using (bucket_id = 'player-images' and public.is_admin());

insert into public.players (slug, full_name, country, birth_date, playing_role, batting_style, bowling_style, biography)
values
    ('sachin-tendulkar', 'Sachin Tendulkar', 'India', '1973-04-24', 'Top-order batter', 'Right-handed', 'Leg break, off break and medium pace', 'https://en.wikipedia.org/wiki/Sachin_Tendulkar'),
    ('virat-kohli', 'Virat Kohli', 'India', '1988-11-05', 'Top-order batter', 'Right-handed', 'Right-arm medium', 'https://en.wikipedia.org/wiki/Virat_Kohli'),
    ('ms-dhoni', 'MS Dhoni', 'India', null, 'Wicketkeeper-batter', 'Right-handed', 'Right-arm medium', 'https://en.wikipedia.org/wiki/MS_Dhoni'),
    ('mithali-raj', 'Mithali Raj', 'India', null, 'Batter', 'Right-handed', null, 'https://en.wikipedia.org/wiki/Mithali_Raj'),
    ('jhulan-goswami', 'Jhulan Goswami', 'India', null, 'Fast bowler', null, 'Right-arm medium-fast', 'https://en.wikipedia.org/wiki/Jhulan_Goswami'),
    ('anil-kumble', 'Anil Kumble', 'India', '1970-10-17', 'Bowler', 'Right-handed', 'Right-arm leg break', 'https://en.wikipedia.org/wiki/Anil_Kumble'),
    ('kapil-dev', 'Kapil Dev', 'India', null, 'All-rounder', 'Right-handed', 'Right-arm fast', 'https://en.wikipedia.org/wiki/Kapil_Dev'),
    ('rohit-sharma', 'Rohit Sharma', 'India', null, 'Opening batter', 'Right-handed', 'Right-arm off break', 'https://en.wikipedia.org/wiki/Rohit_Sharma'),
    ('rahul-dravid', 'Rahul Dravid', 'India', null, 'Batter', 'Right-handed', null, 'https://en.wikipedia.org/wiki/Rahul_Dravid'),
    ('smriti-mandhana', 'Smriti Mandhana', 'India', null, 'Opening batter', 'Left-handed', null, 'https://en.wikipedia.org/wiki/Smriti_Mandhana')
on conflict (slug) do nothing;

insert into public.player_statistics (
    player_id, format, matches, innings, runs, highest_score, batting_average, strike_rate,
    centuries, half_centuries, wickets, bowling_average, economy, bowling_strike_rate,
    best_bowling, five_wicket_hauls, ten_wicket_hauls, source_url, source_kind, verified_at
)
select p.id, stats.format, stats.matches, stats.innings, stats.runs, stats.highest_score,
       stats.batting_average, stats.strike_rate, stats.centuries, stats.half_centuries,
       stats.wickets, stats.bowling_average, stats.economy, stats.bowling_strike_rate,
       stats.best_bowling, stats.five_wicket_hauls, stats.ten_wicket_hauls,
       stats.source_url, 'verified_import', stats.verified_at
from (values
    ('sachin-tendulkar','Test',200,329,15921,'248*',53.78,54.08,51,68,46,null,null,null,null,null,null,'https://en.wikipedia.org/wiki/Sachin_Tendulkar','2013-11-16 00:00:00+00'::timestamptz),
    ('sachin-tendulkar','ODI',463,452,18426,'200*',44.83,86.23,49,96,154,null,null,null,null,null,null,'https://en.wikipedia.org/wiki/Sachin_Tendulkar','2013-03-18 00:00:00+00'::timestamptz),
    ('sachin-tendulkar','T20I',1,1,10,'10',10.00,83.33,0,0,1,null,null,null,null,null,null,'https://en.wikipedia.org/wiki/Sachin_Tendulkar','2006-12-01 00:00:00+00'::timestamptz),
    ('virat-kohli','Test',123,null,9230,'254*',46.85,null,30,31,0,null,null,null,null,0,0,'https://en.wikipedia.org/wiki/Virat_Kohli','2026-09-28 00:00:00+00'::timestamptz),
    ('virat-kohli','ODI',315,null,15080,'183',59.13,null,55,79,5,136.00,null,null,'1/13',0,0,'https://en.wikipedia.org/wiki/Virat_Kohli','2026-09-28 00:00:00+00'::timestamptz),
    ('virat-kohli','T20I',125,null,4188,'122*',48.69,null,1,38,4,51.00,null,null,'1/13',0,0,'https://en.wikipedia.org/wiki/Virat_Kohli','2026-09-28 00:00:00+00'::timestamptz),
    ('anil-kumble','Test',132,null,2506,'110*',17.77,null,1,5,619,29.65,2.69,65.99,'10/74',35,8,'https://en.wikipedia.org/wiki/Anil_Kumble','2008-11-02 00:00:00+00'::timestamptz),
    ('anil-kumble','ODI',271,null,938,'26',10.53,null,0,0,337,30.89,4.30,43.02,'6/12',2,0,'https://en.wikipedia.org/wiki/Anil_Kumble','2007-03-19 00:00:00+00'::timestamptz)
) as stats(
    slug, format, matches, innings, runs, highest_score, batting_average, strike_rate,
    centuries, half_centuries, wickets, bowling_average, economy, bowling_strike_rate,
    best_bowling, five_wicket_hauls, ten_wicket_hauls, source_url, verified_at
)
join public.players p on p.slug = stats.slug
on conflict (player_id, format) do nothing;
