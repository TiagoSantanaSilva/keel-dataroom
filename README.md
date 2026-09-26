# Keel Data Room

A single-page, email-gated data room. Visitors enter their email to view your documents. You get an email notification every time someone visits.

No signups, no logins, no accounts. Just a shareable link and an admin panel to manage files.

## How it works

1. **Visitor goes to your URL** → `https://dataroom.keel.sale`
2. **They enter their email** (validated — must be a real email format)
3. **They see your documents** — download or preview inline
4. **You get an email** → "someone@example.com viewed your data room"
5. **You check visitors** → admin panel at `/admin/YOUR_SECRET`

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env with your config
npm start
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_SECRET` | ✅ | Your admin panel URL path (keep it secret) |
| `OWNER_EMAIL` | ✅ | You get notified here when someone visits |
| `ROOM_TITLE` | — | Your data room name (default: Keel Data Room) |
| `ROOM_DESC` | — | Short description shown on the page |
| `SESSION_SECRET` | ✅ | Long random string for session security |
| `SMTP_HOST` | For email | SMTP server (e.g. smtp.gmail.com) |
| `SMTP_USER` | For email | SMTP email address |
| `SMTP_PASS` | For email | SMTP password / app password |
| `BASE_URL` | ✅ | Your public URL |
| `MAX_FILE_SIZE_MB` | — | Max upload size (default 50) |

## Deploying on Render

1. Push to GitHub
2. On Render → New Web Service → connect repo
3. **Build:** `npm install` / **Start:** `node src/index.js`
4. Add all env vars in Render's Environment tab
5. Set custom domain in Render's Settings

## Deploying on Railway

1. Push to GitHub
2. On Railway → New Project → Deploy from GitHub
3. Auto-detects Node.js — deploys automatically
4. Add env vars in Railway's Variables tab
5. Add custom domain in Railway's Networking tab