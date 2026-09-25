# Keel Data Room

Secure document sharing with email-gated access and visitor tracking — like DocSend, but yours.

## Features

- **Email-gated data rooms** — visitors must enter their email to view contents
- **Unique shareable links** — each data room gets a secure UUID-based URL
- **Visitor tracking** — see who accessed your data room and when
- **Email notifications** — get notified when someone enters your data room
- **Document management** — upload, preview, and organize files per room
- **Self-hosted** — all data stays on your server

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit environment config
cp .env.example .env
# Edit .env with your SMTP settings, session secret, etc.

# 3. Start the server
npm start
```

Visit **http://localhost:3000** — create an account, then create your first data room.

## Deploy to Railway (recommended)

1. **Push to GitHub:**
   ```bash
   cd ~/keel-dataroom
   gh repo create keel-dataroom --public --push
   ```
   Or create the repo on GitHub.com and run the push commands they give you.

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app) and sign in with GitHub
   - Click **New Project** → **Deploy from GitHub repo**
   - Select your `keel-dataroom` repo
   - Railway auto-detects Node.js — deploys in ~60 seconds

3. **Set environment variables** in Railway dashboard → Variables:
   ```
   NODE_ENV=production
   SESSION_SECRET=<generate a long random string>
   BASE_URL=https://dataroom.keel.sale
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=Keel Data Room <noreply@keel.ai>
   ```

4. **Add your domain:**
   - In Railway → Networking → Custom Domain: add `dataroom.keel.sale`
   - Railway gives you a CNAME target (e.g. `something.up.railway.app`)
   - At your DNS provider, create a **CNAME record**: `dataroom` → `<railway CNAME target>`
   - Railway auto-provisions SSL — your site is live at `https://dataroom.keel.sale` within minutes

## Manual deploy (Docker)

```bash
docker build -t keel-dataroom .
docker run -p 3000:3000 \
  -e SESSION_SECRET=... \
  -e BASE_URL=https://dataroom.keel.sale \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  keel-dataroom

## Environment variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `SESSION_SECRET` | *(random)* | Secret for session cookies — change in production |
| `DATABASE_PATH` | `./data/dataroom.db` | SQLite database path |
| `UPLOAD_DIR` | `./uploads` | File upload directory |
| `MAX_FILE_SIZE_MB` | `50` | Max upload size per file |
| `SMTP_HOST` | — | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_SECURE` | `false` | Use TLS for SMTP |
| `SMTP_USER` | — | SMTP username/email |
| `SMTP_PASS` | — | SMTP password or app password |
| `EMAIL_FROM` | — | From address for emails |
| `BASE_URL` | `http://localhost:3000` | Your public URL (used in share links and emails) |

> **Email setup**: Without SMTP, notifications are logged to the console. For Gmail, create an [app password](https://myaccount.google.com/apppasswords). For production, use SendGrid, Mailgun, or Postmark.

## Usage workflow

1. **Sign up** — create your account at `/signup`
2. **Create a data room** — name it (e.g. "Q4 2026 Investor Materials")
3. **Upload documents** — PDFs, images, spreadsheets, presentations
4. **Share the link** — copy the unique URL from the room editor
5. **Visitors enter their email** — they see the gate page first
6. **You get notified** — email arrives with visitor details
7. **Track visits** — see all visitors and timestamps in the dashboard

## Tech stack

- **Node.js** + **Express** — backend
- **SQLite** (better-sqlite3) — database
- **EJS** + **Bootstrap 5** — frontend
- **Multer** — file uploads
- **Nodemailer** — email notifications
- **bcrypt** — password hashing

## License

MIT — built for Keel.