# Uma Boron

Uma Boron is an immersive Durga Puja 2026 experience created by Soham Roy. The application opens directly into the festival rather than a marketing landing page: seven chapter scenes, symbolic interactions, a persistent music layer, nostalgia prompts, calling, private memories and the foundation for private Pujo Together rooms.

## What works locally

- Responsive Mahalaya, Panchami, Shashthi, Saptami, Ashtami, Navami and Dashami chapter navigation.
- Original generated backgrounds inspired by the supplied reference images; the references themselves are not published.
- Mahalaya radio controls and a persistent YouTube-powered Pujo station with progress, seeking, previous/next and automatic continuation.
- Illustration-specific Panchami weapon placement with tap and drag affordances.
- Shashthi mandap curtain reveal.
- Draft Navapatrika learning interaction with an explicit review status.
- Ashtami relationship modes and accessible hand-join interaction.
- Sandhi-themed symbolic anticlockwise lamp circle that distinguishes the 24+24 minute junction.
- Dashami drag/keyboard immersion interaction and replay.
- English chapter copy plus Bengali and Hindi primary chapter copy.
- Manual phone entry, native dialler link, copy/share message and no server-side phone storage.
- Supabase Google/email/password/recovery UI and password setup for a signed-in account.
- Private memory insert wiring for the existing `memories` table.
- Secure-room migration using expiring hashed invite tokens and ownership-aware RLS helpers.

External features are not called live unless configured. See [docs/BLOCKERS.md](docs/BLOCKERS.md) for the exact status.

## Local development

Requirements: Node 24+, npm 11+.

```bash
npm install
cp .env.example .env.local
npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:5173/>. Spotify redirect URIs must use the loopback IP for local development; Spotify does not allow `localhost` redirect URIs.

## Environment variables

Only browser-safe public configuration belongs in Vite variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SPOTIFY_CLIENT_ID` (optional; reserved for a future account-linked enhancement)
- `VITE_SPOTIFY_REDIRECT_URI` (optional)
- `VITE_GOOGLE_CALENDAR_CLIENT_ID` (not yet consumed)

Never put Supabase secret/service-role keys, Spotify client secrets, Google client secrets or SMTP passwords in a `VITE_` variable. Store those only in the relevant provider dashboard or a managed cloud secret store.

## Supabase setup

1. Confirm the existing `profiles` and `memories` columns and ownership RLS in the Supabase dashboard.
2. Apply `supabase/migrations/202610080001_private_rooms.sql` through a reviewed migration workflow.
3. Keep email confirmation enabled.
4. Configure Google as an Auth provider and add both local and final production redirect URLs.
5. Configure a production-capable SMTP provider; the Supabase default sender is for testing only.
6. Test anonymous access and two distinct accounts before enabling cloud room invitations in a public build.

The room migration stores only a SHA-256 digest of each invitation token. Invitations expire, can be revoked before use and can be accepted once. Room/message reads require accepted membership.

## Production build

```bash
npm run lint
npm run build
npm run preview -- --host 127.0.0.1
```

The static output is written to `dist/`. It can be hosted on a free static host while Supabase provides managed cloud identity/data. Production hosting is intentionally not configured yet because the intended Git repository, host and audience have not been confirmed.

## Project structure

- `src/App.jsx` — shell, chapter routing, preview indicator and integration surfaces.
- `src/components/ChapterExperience.jsx` — the seven symbolic chapter interactions.
- `src/components/PersistentPlayer.jsx` — persistent YouTube IFrame API station using official label uploads.
- `src/components/MemoryPanel.jsx` — nostalgia, dialler, sharing and private-save flow.
- `src/components/AuthDialog.jsx` — Supabase account flows.
- `src/data/chapters.js` — chapter copy and playlist mapping.
- `supabase/migrations/` — versioned database changes.
- `docs/CONTENT_SOURCES.md` — asset/source status.
- `docs/BLOCKERS.md` — missing configuration and unverified workflows.

## Cultural and privacy guardrails

Digital actions are described as symbolic and never as completing a ritual. The Panchami layout belongs only to the chosen illustration, Sandhi Puja remains the Ashtami–Navami junction, romantic wording is restricted to partner mode, memories are private by default and phone numbers are never uploaded by the current app.
