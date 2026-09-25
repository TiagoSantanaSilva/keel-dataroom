const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024 },
});

// Dashboard — list all data rooms
router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const rooms = db.prepare(
    `SELECT dr.*, (SELECT COUNT(*) FROM documents WHERE data_room_id = dr.id) AS doc_count,
     (SELECT COUNT(*) FROM visitors WHERE data_room_id = dr.id) AS visitor_count
     FROM data_rooms dr WHERE dr.user_id = ? ORDER BY dr.updated_at DESC`
  ).all(req.session.userId);

  res.render('dashboard', { rooms });
});

// Create new data room form
router.get('/create', requireAuth, (req, res) => {
  res.render('create', { error: null });
});

// Create new data room
router.post('/create', requireAuth, (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.render('create', { error: 'Data room name is required.' });
  }

  const db = getDb();
  const slug = uuidv4();
  db.prepare('INSERT INTO data_rooms (user_id, name, description, slug) VALUES (?, ?, ?, ?)').run(
    req.session.userId,
    name.trim(),
    (description || '').trim(),
    slug
  );

  res.redirect('/dashboard');
});

// Edit data room — view details, manage files, see visitors
router.get('/:id/edit', requireAuth, (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);
  if (!room) return res.status(404).send('Data room not found');

  const documents = db.prepare('SELECT * FROM documents WHERE data_room_id = ? ORDER BY uploaded_at DESC')
    .all(room.id);
  const visitors = db.prepare('SELECT * FROM visitors WHERE data_room_id = ? ORDER BY viewed_at DESC')
    .all(room.id);

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const shareUrl = `${baseUrl}/room/${room.slug}`;

  res.render('edit', { room, documents, visitors, shareUrl, error: null });
});

// Upload document to data room
router.post('/:id/upload', requireAuth, upload.single('file'), (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);
  if (!room) return res.status(404).send('Data room not found');

  if (!req.file) {
    const documents = db.prepare('SELECT * FROM documents WHERE data_room_id = ? ORDER BY uploaded_at DESC').all(room.id);
    const visitors = db.prepare('SELECT * FROM visitors WHERE data_room_id = ? ORDER BY viewed_at DESC').all(room.id);
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/room/${room.slug}`;
    return res.render('edit', { room, documents, visitors, shareUrl, error: 'No file selected.' });
  }

  db.prepare(
    'INSERT INTO documents (data_room_id, name, original_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    room.id,
    req.file.originalname,
    req.file.originalname,
    req.file.filename,
    req.file.mimetype,
    req.file.size,
  );

  db.prepare('UPDATE data_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(room.id);
  res.redirect(`/dashboard/${room.id}/edit`);
});

// Delete a document
router.post('/:roomId/documents/:docId/delete', requireAuth, (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE id = ? AND user_id = ?')
    .get(req.params.roomId, req.session.userId);
  if (!room) return res.status(404).send('Data room not found');

  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND data_room_id = ?')
    .get(req.params.docId, req.params.roomId);
  if (!doc) return res.status(404).send('Document not found');

  // Delete file from disk
  const filePath = path.join(uploadDir, doc.file_path);
  try { require('fs').unlinkSync(filePath); } catch (e) { /* ignore */ }

  db.prepare('DELETE FROM documents WHERE id = ?').run(doc.id);
  res.redirect(`/dashboard/${room.id}/edit`);
});

// Delete data room
router.post('/:id/delete', requireAuth, (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);
  if (!room) return res.status(404).send('Data room not found');

  // Delete all files from disk
  const docs = db.prepare('SELECT file_path FROM documents WHERE data_room_id = ?').all(room.id);
  docs.forEach(doc => {
    const filePath = path.join(uploadDir, doc.file_path);
    try { require('fs').unlinkSync(filePath); } catch (e) { /* ignore */ }
  });

  db.prepare('DELETE FROM data_rooms WHERE id = ?').run(room.id);
  res.redirect('/dashboard');
});

// Update data room name/description
router.post('/:id/update', requireAuth, (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM data_rooms WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);
  if (!room) return res.status(404).send('Data room not found');

  const { name, description } = req.body;
  if (!name || !name.trim()) {
    const documents = db.prepare('SELECT * FROM documents WHERE data_room_id = ? ORDER BY uploaded_at DESC').all(room.id);
    const visitors = db.prepare('SELECT * FROM visitors WHERE data_room_id = ? ORDER BY viewed_at DESC').all(room.id);
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/room/${room.slug}`;
    return res.render('edit', { room, documents, visitors, shareUrl, error: 'Data room name is required.' });
  }

  db.prepare('UPDATE data_rooms SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name.trim(), (description || '').trim(), room.id);

  res.redirect(`/dashboard/${room.id}/edit`);
});

module.exports = router;