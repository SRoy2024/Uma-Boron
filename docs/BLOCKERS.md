# Uma Boron blocker log

Last reviewed: 2026-10-08

- **Git/repository:** this folder is not a Git repository and has no remote. No commits or pushes have been made. Confirm the intended repository first.
- **Supabase schema:** URL and publishable key are configured; Google is enabled. Existing `profiles`/`memories` schema and RLS require dashboard or migration access. Apply and review the room migration before enabling invitations.
- **Security tests:** anonymous and two-user ownership tests require two real test accounts after migration deployment.
- **Email:** Supabase's default sender is demo-only. Configure a free production SMTP sender, domain, templates and recovery redirect.
- **Spotify:** public client ID, exact redirects, quota mode and allowed testers are missing. The app uses official embeds/Open in Spotify and does not claim custom playback.
- **Google Calendar:** OAuth/API configuration is missing. No calendar is written.
- **2026 schedules:** verified Panjika pages and organiser programmes are missing. Chapter dates and exact Sandhi time remain unpublished.
- **Directory:** Bengaluru 2026 venue, opening-hour and ritual details need official confirmation.
- **Image rights:** the four supplied images remain references only. The app ships original generated artwork.
- **Reference links:** the supplied Google share and YouTube links were not retrievable by the research tool and were not treated as verified sources.
- **Hosting/audience:** public/private audience and production host are not confirmed. Nothing has been deployed.

Known implementation limits: secondary Bengali/Hindi controls need reviewed translation; Panchami targets need cultural approval; private invites need migration deployment; memory saving needs live RLS verification; generated art is illustration, not documentary photography.
