---
name: keel-dataroom
description: Self-hosted DocSend-style data room app built in the keel-dataroom repo
metadata:
  type: project
---

Keel's Data Room app is a full-stack Node.js/Express web app at `/home/ubuntu/keel-dataroom`. It provides email-gated document sharing with visitor tracking and notifications, modeled after DocSend.

**How to run:** `cd ~/keel-dataroom && npm start` (serves on port 3000 by default).

**Key features:** Email-gated access (visitors must enter email), unique UUID-based share URLs per room, document upload/preview/download, visitor analytics dashboard, email notifications to owner on each visit, session-based auth with bcrypt.

**Tech stack:** Node.js, Express, SQLite (better-sqlite3), EJS + Bootstrap 5 frontend, Multer for uploads, Nodemailer for emails.

**Why this approach:** The user wanted a self-hosted alternative to DocSend. Used SQLite (zero setup, no external DB), server-rendered EJS (simple deployment), and email-gate pattern matching DocSend's workflow. [[keel-brand-building]]

**What's next:** Deploy behind a reverse proxy with HTTPS, configure SMTP for real email notifications, add branding customization.