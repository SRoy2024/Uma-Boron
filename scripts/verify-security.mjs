import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [headers, redirects, appCss, player, auth, memory, migration, reelsMigration, reelsHook, mapSection, app, privacy, terms, main, errorBoundary] = await Promise.all([
  read('public/_headers'),
  read('public/_redirects'),
  read('src/App.css'),
  read('src/components/PersistentPlayer.jsx'),
  read('src/components/AuthDialog.jsx'),
  read('src/components/MemoryPanel.jsx'),
  read('supabase/migrations/202610090001_security_hardening.sql'),
  read('supabase/migrations/202610090003_festival_reels.sql'),
  read('src/hooks/useFestivalReels.js'),
  read('src/components/PandalMapSection.jsx'),
  read('src/App.jsx'),
  read('public/privacy.html'),
  read('public/terms.html'),
  read('src/main.jsx'),
  read('src/components/AppErrorBoundary.jsx'),
])

for (const directive of [
  "default-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Strict-Transport-Security:',
  'Permissions-Policy:',
]) assert.ok(headers.includes(directive), `missing deployment header: ${directive}`)

assert.match(redirects, /\/\* \/index\.html 200/, 'SPA fallback is missing')
assert.match(player, /event\.source !== iframeRef\.current\?\.contentWindow/, 'YouTube message source must be pinned')
assert.match(player, /'https:\/\/www\.youtube\.com'/, 'YouTube origin must be explicit')
assert.doesNotMatch(player, /endsWith\('youtube\.com'\)/, 'suffix origin checks are unsafe')
assert.match(auth, /maxLength="254"/, 'email length bound is missing')
assert.match(auth, /maxLength="128"/, 'password length bound is missing')
assert.match(auth, /queryParams: \{ prompt: 'select_account' \}/, 'Google OAuth account selection is missing')
assert.match(auth, /password_enabled: true/, 'Google fallback password marker is missing')
assert.match(app, /requiresGooglePassword/, 'Google users are not gated on fallback password creation')
assert.match(memory, /maxLength=\{80\}/, 'contact name length bound is missing')
assert.match(memory, /maxLength=\{32\}/, 'contact phone length bound is missing')

for (const dbRule of [
  'alter table public.memories enable row level security',
  'alter table public.memories force row level security',
  'user_id = auth.uid()',
  'guard_memory_write',
  'guard_room_invite_write',
  'guard_room_message_write',
  "p_invite_token !~ '^[0-9a-f]{64}$'",
]) assert.ok(migration.includes(dbRule), `missing database safeguard: ${dbRule}`)

for (const reelsRule of [
  'alter table public.festival_reels enable row level security',
  'alter table public.festival_reels force row level security',
  'Public can read active festival reels',
  "auth.jwt() -> 'app_metadata' ->> 'role'",
]) assert.ok(reelsMigration.includes(reelsRule), `missing reels database safeguard: ${reelsRule}`)

assert.match(reelsHook, /SAFE_VIDEO_HOSTS/, 'reel URLs are not allow-listed')
assert.match(reelsHook, /\.from\('festival_reels'\)/, 'reels are not loaded from the live database')
assert.ok(headers.includes('https://i.ytimg.com'), 'YouTube thumbnails are blocked by the CSP')
assert.ok(headers.includes('https://maps.google.com'), 'Google Maps embeds are blocked by the CSP')
assert.match(mapSection, /fetchNearbyPujos/, 'nearby venues are not loaded from a live provider')
assert.match(mapSection, /buildGoogleMapsEmbedUrl/, 'the map is not centred dynamically on the selected location')
assert.doesNotMatch(mapSection, /pujosData/, 'the live nearby map must not merge a hardcoded venue list')
assert.match(privacy, /Supabase Auth/, 'privacy policy must identify the authentication processor')
assert.match(privacy, /Google sign-in/, 'privacy policy must explain Google account data')
assert.match(terms, /Acceptable use/, 'terms must define acceptable use')
assert.match(app, /href="\/privacy\.html"/, 'privacy policy is not linked from the app')

for (const responsiveRule of [
  '@media (min-width:1600px)',
  '@media (max-width:600px)',
  '@media (max-width:420px)',
  '@media (max-width:350px)',
  '@media (hover:none) and (pointer:coarse)',
  '@media (max-height:500px) and (orientation:landscape)',
  '@media print',
]) assert.ok(appCss.includes(responsiveRule), `missing responsive rule: ${responsiveRule}`)

assert.ok(main.includes('<AppErrorBoundary>'), 'root error boundary is not mounted')
assert.ok(errorBoundary.includes('getDerivedStateFromError'), 'error boundary is incomplete')

console.log('Security and responsive deployment checks passed.')
