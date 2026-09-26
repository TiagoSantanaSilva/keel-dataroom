require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./db');
const { sendNotification } = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;

// Config from env
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin';
const OWNER_EMAIL = process.env.OWNER_EMAIL || '';
const ROOM_TITLE = process.env.ROOM_TITLE || 'Keel Data Room';
const ROOM_DESC = process.env.ROOM_DESC || '';

// Ensure data directory exists
const dataDir = path.dirname(process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'dataroom.db'));
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Valid email check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve public static files (CSS, JS, images, icons)
app.use(express.static(path.join(__dirname, '..', 'public')));

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
  if (!isValidEmail(email)) {
    return res.render('gate', { error: 'Please enter a valid email address.', email });
  }

  const visitorEmail = email.trim().toLowerCase();
  const db = getDb();

  db.prepare(
    'INSERT INTO visitors (email, name, ip_address, user_agent) VALUES (?, ?, ?, ?)'
  ).run(visitorEmail, (name || '').trim(), req.ip || '', req.get('User-Agent') || '');

  req.session.hasAccess = true;
  req.session.visitorEmail = visitorEmail;

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
  const items = db.prepare('SELECT * FROM items ORDER BY sort_order ASC, added_at DESC').all();
  res.render('room', { items, visitorEmail: req.session.visitorEmail || '' });
});

// ─── ADMIN ROUTES (uses :secret param checked internally) ───

// Admin panel
app.get('/admin/:check', (req, res, next) => {
  if (req.params.check !== ADMIN_SECRET) return next();
  const db = getDb();
  const items = db.prepare('SELECT * FROM items ORDER BY sort_order ASC, added_at DESC').all();
  const visitors = db.prepare('SELECT * FROM visitors ORDER BY viewed_at DESC').all();
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.render('admin', {
    items, visitors, error: null, success: null,
    shareUrl: baseUrl + '/',
    adminPrefix: '/admin/' + ADMIN_SECRET,
  });
});

// Add a link
app.post('/admin/:check/add', (req, res, next) => {
  if (req.params.check !== ADMIN_SECRET) return next();
  const { name, url, description } = req.body;
  if (!name || !name.trim()) {
    const db = getDb();
    const items = db.prepare('SELECT * FROM items ORDER BY sort_order ASC, added_at DESC').all();
    const visitors = db.prepare('SELECT * FROM visitors ORDER BY viewed_at DESC').all();
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return res.render('admin', { items, visitors, error: 'Link name is required.', success: null,
      shareUrl: baseUrl + '/', adminPrefix: '/admin/' + ADMIN_SECRET });
  }
  if (!url || !url.trim()) {
    const db = getDb();
    const items = db.prepare('SELECT * FROM items ORDER BY sort_order ASC, added_at DESC').all();
    const visitors = db.prepare('SELECT * FROM visitors ORDER BY viewed_at DESC').all();
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return res.render('admin', { items, visitors, error: 'URL is required.', success: null,
      shareUrl: baseUrl + '/', adminPrefix: '/admin/' + ADMIN_SECRET });
  }
  let finalUrl = url.trim();
  if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
  const db = getDb();
  db.prepare('INSERT INTO items (name, url, description) VALUES (?, ?, ?)').run(
    name.trim(), finalUrl, (description || '').trim());
  res.redirect('/admin/' + ADMIN_SECRET);
});

// Delete a link
app.post('/admin/:check/delete/:id', (req, res, next) => {
  if (req.params.check !== ADMIN_SECRET) return next();
  const db = getDb();
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.redirect('/admin/' + ADMIN_SECRET);
});

// Reorder links
app.post('/admin/:check/reorder/:id/:direction', (req, res, next) => {
  if (req.params.check !== ADMIN_SECRET) return next();
  const db = getDb();
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.redirect('/admin/' + ADMIN_SECRET);
  const direction = req.params.direction === 'up' ? 'up' : 'down';
  const other = direction === 'up'
    ? db.prepare('SELECT * FROM items WHERE sort_order < ? ORDER BY sort_order DESC LIMIT 1').get(item.sort_order)
    : db.prepare('SELECT * FROM items WHERE sort_order > ? ORDER BY sort_order ASC LIMIT 1').get(item.sort_order);
  if (other) {
    db.prepare('UPDATE items SET sort_order = ? WHERE id = ?').run(other.sort_order, item.id);
    db.prepare('UPDATE items SET sort_order = ? WHERE id = ?').run(item.sort_order, other.id);
  }
  res.redirect('/admin/' + ADMIN_SECRET);
});

// Clear all visitors
app.post('/admin/:check/clear-visitors', (req, res, next) => {
  if (req.params.check !== ADMIN_SECRET) return next();
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
  console.log(`\n  🔗 Keel Data Room running at http://localhost:${PORT}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Data Room:   http://localhost:${PORT}`);
  console.log(`  Admin:       http://localhost:${PORT}/admin/${ADMIN_SECRET}`);
  console.log(`  Owner email: ${OWNER_EMAIL || 'Not set'}\n`);
});