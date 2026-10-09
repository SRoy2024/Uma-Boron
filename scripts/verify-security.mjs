import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [headers, redirects, appCss, player, auth, memory, migration, main, errorBoundary] = await Promise.all([
  read('public/_headers'),
  read('public/_redirects'),
  read('src/App.css'),
  read('src/components/PersistentPlayer.jsx'),
  read('src/components/AuthDialog.jsx'),
  read('src/components/MemoryPanel.jsx'),
  read('supabase/migrations/202610090001_security_hardening.sql'),
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
