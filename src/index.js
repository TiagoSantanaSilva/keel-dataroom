require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const dataroomRoutes = require('./routes/dataroom');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload and data directories exist
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const dataDir = path.dirname(process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'dataroom.db'));
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

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
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail,
  } : null;
  res.locals.currentPath = req.path;
  next();
});

// Static files
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/room', dataroomRoutes);

// Home page
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/login');
});

// Error page
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong. Please try again.' });
});

// 404
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

app.listen(PORT, () => {
  console.log(`\n  🏢 Keel Data Room running at http://localhost:${PORT}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Dashboard:  http://localhost:${PORT}/dashboard`);
  console.log(`  Sign up:    http://localhost:${PORT}/signup`);
  console.log(`  Login:      http://localhost:${PORT}/login\n`);
});