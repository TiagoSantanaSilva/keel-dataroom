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