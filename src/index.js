require('dotenv').config();

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./db');
const { sendNotification } = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;

// Config from env
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin';
const OWNER_EMAIL = process.env.OWNER_EMAIL || '';
const ROOM_TITLE = process.env.ROOM_TITLE || 'Keel Data Room';
const ROOM_DESC = process.env.ROOM_DESC || '';

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const dataDir = path.dirname(process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'dataroom.db'));
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Config multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024 },
});

// Valid email check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'keel-dataroom-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Make room info available to all views
app.use((req, res, next) => {
  res.locals.roomTitle = ROOM_TITLE;
  res.locals.roomDesc = ROOM_DESC;
  res.locals.pageTitle = '';
  res.locals.currentPath = req.path;
  next();
});

// Trust proxy (Render / Cloudflare)
app.set('trust proxy', 1);

// ─── PUBLIC ROUTES ───

// Home — email gate
app.get('/', (req, res) => {
  if (req.session.hasAccess) return res.redirect('/view');
  res.render('gate', { error: null, email: '' });
});

// Handle email submission
app.post('/', (req, res) => {
  const { email, name } = req.body;

  if (!email || !email.trim()) {
    return res.render('gate', { error: 'Email is required.', email: '' });
  }
  if (!isValidEmail(email.trim())) {
    return res.render('gate', { error: 'Please enter a valid email address.', email });
  }

  const visitorEmail = email.trim().toLowerCase();
  const db = getDb();

  // Record visitor
  db.prepare(
    'INSERT INTO visitors (email, name, ip_address, user_agent) VALUES (?, ?, ?, ?)'
  ).run(visitorEmail, (name || '').trim(), req.ip || '', req.get('User-Agent') || '');

  // Grant access in session
  req.session.hasAccess = true;
  req.session.visitorEmail = visitorEmail;

  // Notify owner
  if (OWNER_EMAIL) {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    sendNotification(
      OWNER_EMAIL,
      ROOM_TITLE,
      visitorEmail,
      (name || '').trim(),
      baseUrl + '/admin/' + ADMIN_SECRET
    ).catch(e => console.error('[EMAIL] Failed:', e.message));
  }

  res.redirect('/view');
});

// View data room (requires email gate)
app.get('/view', (req, res) => {
  if (!req.session.hasAccess) return res.redirect('/');
  const db = getDb();
  const documents = db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC').all();
  res.render('room', { documents, visitorEmail: req.session.visitorEmail || '' });
});

// Download document
app.get('/download/:id', (req, res) => {
  if (!req.session.hasAccess) return res.redirect('/');
  const db = getDb();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).send('Document not found');
  res.download(path.join(uploadDir, doc.file_path), doc.original_name);
});

// Preview document
app.get('/preview/:id', (req, res) => {
  if (!req.session.hasAccess) return res.redirect('/');
  const db = getDb();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).send('Document not found');
  const filePath = path.join(uploadDir, doc.file_path);
  const ext = path.extname(doc.original_name).toLowerCase();
  if (['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
    const mimeMap = {
      '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    };
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } else {
    res.download(filePath, doc.original_name);
  }
});

// ─── ADMIN ROUTES ───

// Admin — manage files and see visitors
app.get('/admin/' + ADMIN_SECRET, (req, res) => {
  const db = getDb();
  const documents = db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC').all();
  const visitors = db.prepare('SELECT * FROM visitors ORDER BY viewed_at DESC').all();
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.render('admin', {
    documents,
    visitors,
    shareUrl: baseUrl + '/',
    error: null,
    adminPrefix: '/admin/' + ADMIN_SECRET,
  });
});

// Admin — upload file
app.post('/admin/' + ADMIN_SECRET + '/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    const db = getDb();
    const documents = db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC').all();
    const visitors = db.prepare('SELECT * FROM visitors ORDER BY viewed_at DESC').all();
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return res.render('admin', {
      documents,
      visitors,
      shareUrl: baseUrl + '/',
      error: 'No file selected.',
      adminPrefix: '/admin/' + ADMIN_SECRET,
    });
  }
  const db = getDb();
  db.prepare(
    'INSERT INTO documents (name, original_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)'
  ).run(req.file.originalname, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size);
  res.redirect('/admin/' + ADMIN_SECRET);
});

// Admin — delete document
app.post('/admin/' + ADMIN_SECRET + '/delete/:id', (req, res) => {
  const db = getDb();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (doc) {
    const fpath = path.join(uploadDir, doc.file_path);
    try { fs.unlinkSync(fpath); } catch (e) { /* ignore */ }
    db.prepare('DELETE FROM documents WHERE id = ?').run(doc.id);
  }
  res.redirect('/admin/' + ADMIN_SECRET);
});

// Admin — clear all visitors
app.post('/admin/' + ADMIN_SECRET + '/clear-visitors', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM visitors').run();
  res.redirect('/admin/' + ADMIN_SECRET);
});

// ─── ERROR HANDLING ───

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong. Please try again.' });
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

// ─── START ───

app.listen(PORT, () => {
  console.log(`\n  📁 Keel Data Room running at http://localhost:${PORT}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Data Room:   http://localhost:${PORT}`);
  console.log(`  Admin:       http://localhost:${PORT}/admin/${ADMIN_SECRET}`);
  console.log(`  Owner email: ${OWNER_EMAIL || 'Not set — add OWNER_EMAIL to .env'}\n`);
});