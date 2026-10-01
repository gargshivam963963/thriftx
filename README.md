<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0b072784-44b1-48a2-8473-df1be2ae0411

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Authentication Configuration

Better Auth uses the absolute application URL in `BETTER_AUTH_URL` and serves
its API at `/api/auth`. Configure `BETTER_AUTH_SECRET` with a random secret of
at least 32 characters. Generate one with `openssl rand -base64 48`, and set it
in both your local environment and Vercel's Production environment. The app
fails fast if this secret is missing or too short; it never falls back to a
development secret.

Google OAuth credentials are server-only: `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`. Register these callback URLs with Google:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://YOUR_DOMAIN/api/auth/callback/google`

Email verification and password reset use Resend. Configure the server-only
`RESEND_API_KEY` and `EMAIL_FROM`; both are required before email signup or
password reset can complete.
