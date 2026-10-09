create table if not exists public.festival_reels (
  id text primary key check (id ~ '^[a-z0-9-]{3,80}$'),
  chapter_id text not null check (chapter_id in ('mahalaya', 'panchami', 'shashthi', 'saptami', 'ashtami', 'navami', 'dashami')),
  day_name text not null check (char_length(day_name) between 2 and 40),
  title text not null check (char_length(title) between 3 and 180),
  bengali_title text not null check (char_length(bengali_title) between 2 and 180),
  creator text not null check (char_length(creator) between 2 and 100),
  creator_name text not null check (char_length(creator_name) between 2 and 100),
  location text not null check (char_length(location) between 2 and 140),
  video_url text not null check (video_url ~ '^https://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{6,}'),
  platform text not null default 'YouTube' check (platform = 'YouTube'),
  thumbnail_url text check (thumbnail_url is null or thumbnail_url ~ '^https://(i\.ytimg\.com|img\.youtube\.com)/'),
  thumbnail_gradient text not null default 'linear-gradient(135deg, #24150d, #78451e, #d9a441)',
  tags text[] not null default '{}',
  summary text not null check (char_length(summary) between 3 and 400),
  position smallint not null check (position between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.festival_reels enable row level security;
alter table public.festival_reels force row level security;

revoke all on table public.festival_reels from anon, authenticated;
grant select on table public.festival_reels to anon, authenticated;
grant insert, update, delete on table public.festival_reels to authenticated;

drop policy if exists "Public can read active festival reels" on public.festival_reels;
create policy "Public can read active festival reels"
  on public.festival_reels for select
  to anon, authenticated
  using (is_active = true or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Administrators can insert festival reels" on public.festival_reels;
create policy "Administrators can insert festival reels"
  on public.festival_reels for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Administrators can update festival reels" on public.festival_reels;
create policy "Administrators can update festival reels"
  on public.festival_reels for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Administrators can delete festival reels" on public.festival_reels;
create policy "Administrators can delete festival reels"
  on public.festival_reels for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.festival_reels
  (id, chapter_id, day_name, title, bengali_title, creator, creator_name, location, video_url, thumbnail_url, thumbnail_gradient, tags, summary, position)
values
  ('mahalaya-chandipath', 'mahalaya', 'Mahalaya', 'Original Chandipath in the voice of Birendra Krishna Bhadra', 'মহালয়ার ভোরে মহিষাসুরমর্দিনী', 'Bangla Vision Desk', 'Bangla Vision Desk', 'Bengal · Mahalaya dawn tradition', 'https://www.youtube.com/watch?v=pKevDoR-TeI', 'https://i.ytimg.com/vi/pKevDoR-TeI/hqdefault.jpg', 'linear-gradient(135deg, #1f140e 0%, #4a2c11 50%, #d48b38 100%)', array['#Mahalaya', '#Chandipath', '#BirendraKrishnaBhadra'], 'A full Mahalaya Chandipath recording for the pre-dawn ritual that begins Debipaksha across Bengal.', 1),
  ('panchami-chokkhudaan', 'panchami', 'Panchami', 'Maa Durga Chokkhu Daan before Mahalaya', 'কুমারটুলিতে দেবীর চক্ষুদান', 'Explore With Bidisha', 'Explore With Bidisha', 'Dumdum Kumartuli, Kolkata', 'https://www.youtube.com/watch?v=g3IAjDI5Ti0', 'https://i.ytimg.com/vi/g3IAjDI5Ti0/hqdefault.jpg', 'linear-gradient(135deg, #2b1d16 0%, #683820 50%, #c47d4e 100%)', array['#Kumartuli', '#ChokkhuDaan', '#Panchami'], 'A close look at the final artisan process as the eyes of the Durga pratima are painted.', 2),
  ('shashthi-pandal-hopping', 'shashthi', 'Shashthi', 'Kolkata Durga Puja: from rituals to pandal hopping', 'মহাষষ্ঠীর বোধন ও মণ্ডপ দর্শন', 'Naveen Rawat', 'Naveen Rawat', 'Kolkata, West Bengal', 'https://www.youtube.com/watch?v=MEuFFRRZUZo', 'https://i.ytimg.com/vi/MEuFFRRZUZo/hqdefault.jpg', 'linear-gradient(135deg, #2d0b0b 0%, #7d1c1c 50%, #d4a038 100%)', array['#Shashthi', '#Bodhon', '#PandalHopping'], 'A five-day Kolkata journey beginning with Shashthi rituals and the opening of the city’s pandals.', 3),
  ('saptami-kola-bou', 'saptami', 'Saptami', 'Maha Saptami Kola Bou Snan performed in Kolkata', 'সপ্তমী ভোরে নবপত্রিকা স্নান', 'News On AIR Official', 'News On AIR Official', 'Kolkata, West Bengal', 'https://www.youtube.com/watch?v=YSqYKEIZ2Os', 'https://i.ytimg.com/vi/YSqYKEIZ2Os/hqdefault.jpg', 'linear-gradient(135deg, #10261b 0%, #205c38 50%, #8ac47d 100%)', array['#MahaSaptami', '#KolaBou', '#Navapatrika'], 'News On AIR documents the dawn bathing ritual of the Navapatrika on Maha Saptami.', 4),
  ('ashtami-anjali', 'ashtami', 'Ashtami', 'Maha Ashtami Anjali in Kolkata', 'মহাষ্টমীর পুষ্পাঞ্জলি', 'Adrija Roy', 'Adrija Roy', 'Kolkata, West Bengal', 'https://www.youtube.com/watch?v=CbNIJF37RWU', 'https://i.ytimg.com/vi/CbNIJF37RWU/hqdefault.jpg', 'linear-gradient(135deg, #2b111a 0%, #6d1b32 50%, #e0b64c 100%)', array['#MahaAshtami', '#Pushpanjali', '#Kolkata'], 'A personal view of the devotion, flowers, and family gathering around Maha Ashtami Anjali.', 5),
  ('navami-dhunuchi-naach', 'navami', 'Navami', 'Dhunuchi Naach with live dhaak beats', 'নবমীর ধুনুচি নাচ ও সন্ধ্যা আরতি', 'Sneha Ghosh', 'Sneha Ghosh', 'Rilbong Puja, Shillong', 'https://www.youtube.com/watch?v=fikIhTLhv1w', 'https://i.ytimg.com/vi/fikIhTLhv1w/hqdefault.jpg', 'linear-gradient(135deg, #260a00 0%, #6d2400 50%, #ff8c1a 100%)', array['#DhunuchiNaach', '#Navami', '#Dhaak'], 'A live Navami-evening dhunuchi dance performed before Maa Durga to the rhythm of dhaak.', 6),
  ('dashami-sindoor-visarjan', 'dashami', 'Dashami', 'Vijaya Dashami: Sindoor Khela and Visarjan in Kolkata', 'সিঁদুর খেলা থেকে বিসর্জন', 'Delhi Food Walks', 'Delhi Food Walks', 'Bagbazar and North Kolkata', 'https://www.youtube.com/watch?v=_LSeEUcEbGc', 'https://i.ytimg.com/vi/_LSeEUcEbGc/hqdefault.jpg', 'linear-gradient(135deg, #101c2d 0%, #1c3d5c 50%, #e8a25c 100%)', array['#BijoyaDashami', '#SindoorKhela', '#Visarjan'], 'A verified creator’s documentary journey through Sindoor Khela, community meals, and the final immersion.', 7)
on conflict (id) do update set
  chapter_id = excluded.chapter_id, day_name = excluded.day_name, title = excluded.title,
  bengali_title = excluded.bengali_title, creator = excluded.creator, creator_name = excluded.creator_name,
  location = excluded.location, video_url = excluded.video_url, thumbnail_url = excluded.thumbnail_url,
  thumbnail_gradient = excluded.thumbnail_gradient, tags = excluded.tags, summary = excluded.summary,
  position = excluded.position, is_active = true, updated_at = now();
