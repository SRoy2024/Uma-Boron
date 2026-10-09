# Deploy Uma Boron free with Cloudflare Pages

Cloudflare Pages is the simplest free host for this Vite build. It serves the static site through Cloudflare, applies the security headers in `public/_headers`, and automatically rebuilds when the connected repository changes.

## 1. Pre-deployment check

From the project folder:

```bash
npm ci
npm run check
```

Do not deploy if this command fails. Apply `supabase/migrations/202610090001_security_hardening.sql` to the production Supabase project before enabling cloud memory or room writes.

## 2. Put the project in a Git repository

Create a private or public GitHub/GitLab repository, commit this project, and push it. Never commit `.env.local`, Supabase secret/service-role keys, SMTP credentials, OAuth client secrets, or a Turnstile secret.

## 3. Create the Pages project

In Cloudflare Dashboard:

1. Open **Workers & Pages** and create a Pages project from the repository.
2. Choose the repository root containing this `package.json`.
3. Set **Build command** to `npm run build`.
4. Set **Build output directory** to `dist`.
5. Add these build variables using the existing browser-safe values from `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_GOOGLE_CALENDAR_CLIENT_ID` only if Google Calendar OAuth is later implemented
6. Deploy. Cloudflare will provide a `*.pages.dev` URL.

The Supabase publishable key is designed for browser use. Security must come from RLS and server-side policies; never substitute a service-role key.

## 4. Finish Supabase production settings

In Supabase Dashboard:

1. Under **Authentication → URL Configuration**, set the Pages production URL as the Site URL and add the production/preview redirect URLs you actually use.
2. Confirm email verification, Google provider settings, and production SMTP if email signup/recovery is required.
3. Review **Authentication → Rate Limits** and keep limits conservative.
4. Apply the included migrations, then verify anonymous access is rejected and two signed-in test users cannot read or edit each other's memories.

## 5. Turnstile bot protection (account-bound final step)

Turnstile cannot be secured with frontend code alone. A production setup needs a Cloudflare widget restricted to the final domain and its secret stored in Supabase:

1. Create a managed Turnstile widget for the final `pages.dev` or custom domain (and local development domains while testing).
2. In **Supabase → Authentication → Bot and Abuse Protection**, enable Cloudflare Turnstile and store the widget secret there.
3. Add the public site key to the auth UI and pass each fresh `captchaToken` to Supabase sign-in, sign-up, and recovery calls.
4. Test one valid token and confirm an expired/replayed token is rejected.

Do not place the Turnstile secret in any `VITE_` variable or repository file. The code integration should be completed only after the final domain and widget are approved.

## 6. Launch checks

- Open the deployed site at 320, 360, 390, 768, 1024, 1440, and ultrawide widths.
- Test a short landscape phone, browser zoom at 200%, keyboard navigation, reduced-motion mode, and the expanded radio.
- Confirm security response headers in the browser Network panel.
- Test Google sign-in redirects, email signup/recovery, location permission denial/manual search, ICS/Google Calendar links, YouTube playback in a normal browser, and Supabase RLS with two separate accounts.
- Enable repository dependency alerts and rerun `npm audit --omit=dev` in connected CI.

Useful official references:

- Cloudflare Pages headers: https://developers.cloudflare.com/pages/configuration/headers/
- Cloudflare Pages framework deployment: https://developers.cloudflare.com/pages/framework-guides/
- Cloudflare DDoS protection: https://developers.cloudflare.com/ddos-protection/get-started/
- Supabase CAPTCHA: https://supabase.com/docs/guides/auth/auth-captcha
- Supabase Auth rate limits: https://supabase.com/docs/guides/auth/rate-limits
- Supabase production checklist: https://supabase.com/docs/guides/deployment/going-into-prod
