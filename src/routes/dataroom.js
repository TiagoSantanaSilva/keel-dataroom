const express = require('express');
const path = require('path');
const { getDb } = require('../db');
const { sendNotification, sendAccessGranted } = require('../email');

const router = express.Router();

// Public data room — email gate
router.get('/:slug', (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE slug = ?').get(req.params.slug);
  if (!room) return res.status(404).render('error', { message: 'Data room not found.' });

  // Check if visitor already has access (session-based)
  const accessKey = `room_access_${room.id}`;
  if (req.session[accessKey]) {
    return res.redirect(`/room/${room.slug}/view`);
  }

  res.render('gate', { room, error: null, email: '' });
});

// Handle email gate submission
router.post('/:slug', (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE slug = ?').get(req.params.slug);
  if (!room) return res.status(404).render('error', { message: 'Data room not found.' });

  const { email, name } = req.body;
  if (!email || !email.trim()) {
    return res.render('gate', { room, error: 'Email is required to access this data room.', email: '' });
  }

  const visitorEmail = email.trim().toLowerCase();

  // Record the visit
  db.prepare(
    'INSERT INTO visitors (data_room_id, email, name, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)'
  ).run(room.id, visitorEmail, (name || '').trim(), req.ip || '', req.get('User-Agent') || '');

  // Grant access in session
  req.session[`room_access_${room.id}`] = true;
  req.session[`room_email_${room.id}`] = visitorEmail;

  // Notify the owner
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const shareUrl = `${baseUrl}/room/${room.slug}`;
  sendNotification(
    req.session.userEmail || db.prepare('SELECT email FROM users WHERE id = ?').get(room.user_id)?.email,
    room.name,
    visitorEmail,
    name || '',
    shareUrl
  ).catch(e => console.error('[EMAIL] Failed to send notification:', e.message));

  // Send access confirmation to visitor
  sendAccessGranted(visitorEmail, room.name, `${baseUrl}/room/${room.slug}/view`)
    .catch(e => console.error('[EMAIL] Failed to send access confirmation:', e.message));

  res.redirect(`/room/${room.slug}/view`);
});

// View data room contents (requires prior email gate)
router.get('/:slug/view', (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE slug = ?').get(req.params.slug);
  if (!room) return res.status(404).render('error', { message: 'Data room not found.' });

  const accessKey = `room_access_${room.id}`;
  if (!req.session[accessKey]) {
    return res.redirect(`/room/${room.slug}`);
  }

  const documents = db.prepare('SELECT * FROM documents WHERE data_room_id = ? ORDER BY uploaded_at DESC')
    .all(room.id);

  const visitorEmail = req.session[`room_email_${room.id}`] || '';

  res.render('room', { room, documents, visitorEmail, baseUrl: process.env.BASE_URL || `${req.protocol}://${req.get('host')}` });
});

// Download a document
router.get('/:slug/download/:docId', (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE slug = ?').get(req.params.slug);
  if (!room) return res.status(404).send('Data room not found');

  const accessKey = `room_access_${room.id}`;
  if (!req.session[accessKey]) {
    return res.redirect(`/room/${room.slug}`);
  }

  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND data_room_id = ?')
    .get(req.params.docId, room.id);
  if (!doc) return res.status(404).send('Document not found');

  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
  res.download(path.join(uploadDir, doc.file_path), doc.original_name);
});

// Preview a document (for supported types)
router.get('/:slug/preview/:docId', (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE slug = ?').get(req.params.slug);
  if (!room) return res.status(404).send('Data room not found');

  const accessKey = `room_access_${room.id}`;
  if (!req.session[accessKey]) {
    return res.redirect(`/room/${room.slug}`);
  }

  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND data_room_id = ?')
    .get(req.params.docId, room.id);
  if (!doc) return res.status(404).send('Document not found');

  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
  const filePath = path.join(uploadDir, doc.file_path);

  // Serve PDFs inline, images directly, other files as download
  const ext = path.extname(doc.original_name).toLowerCase();
  if (['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
    const mimeMap = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    };
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } else {
    res.download(filePath, doc.original_name);
  }
});

module.exports = router;