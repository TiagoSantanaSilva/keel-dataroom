const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../db');
const { redirectIfAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', redirectIfAuth, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Email and password are required.' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.render('login', { error: 'Invalid email or password.' });
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.render('login', { error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  req.session.userName = user.name;
  req.session.userEmail = user.email;
  res.redirect('/dashboard');
});

router.get('/signup', redirectIfAuth, (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', redirectIfAuth, (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password) {
    return res.render('signup', { error: 'All fields are required.' });
  }
  if (password.length < 8) {
    return res.render('signup', { error: 'Password must be at least 8 characters.' });
  }
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match.' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.render('signup', { error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(
    name.trim(),
    email.toLowerCase().trim(),
    passwordHash
  );

  req.session.userId = result.lastInsertRowid;
  req.session.userName = name.trim();
  req.session.userEmail = email.toLowerCase().trim();
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;