import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../db/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-assetflow-key-phrase';

// User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, department } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  try {
    // Check if user exists
    const users = await db.query('SELECT uid FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = `user-${Date.now()}`;
    const role = 'User';
    const provider = 'Email/Password';
    const now = new Date();

    // Insert user account
    await db.query(
      'INSERT INTO users (uid, name, email, password, department, role, provider, createdAt, lastLoginAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [uid, name, email, hashedPassword, department || 'IT Operations', role, provider, now, now]
    );

    // Sync into employees catalog
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    await db.query(
      'INSERT INTO employees (id, name, email, department, role, avatar) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      [uid, name, email, department || 'IT Operations', 'Employee', avatar]
    );

    res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration API Error:', error);
    res.status(500).json({ error: 'Internal server error occurred.' });
  }
});

// User Sign In
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const foundUser = users[0];
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Update login timestamp
    const now = new Date();
    await db.query('UPDATE users SET lastLoginAt = ? WHERE uid = ?', [now, foundUser.uid]);

    // Sign JWT
    const token = jwt.sign({ uid: foundUser.uid, role: foundUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const avatar = foundUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    res.json({
      token,
      user: {
        uid: foundUser.uid,
        name: foundUser.name,
        email: foundUser.email,
        department: foundUser.department,
        role: foundUser.role,
        avatar,
        provider: foundUser.provider
      }
    });
  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ error: 'Internal server error occurred.' });
  }
});

// Google SSO Authentication
router.post('/google', async (req, res) => {
  const { email, name, department } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing name or email coordinates from Google callback.' });
  }

  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let foundUser;

    const now = new Date();

    if (users.length === 0) {
      // First-time login: create new user profile document in MySQL
      const uid = `google-${Date.now()}`;
      const role = 'User';
      const provider = 'Google';
      const mockHashedPass = 'google-sso-bypass-key-secured';

      await db.query(
        'INSERT INTO users (uid, name, email, password, department, role, provider, createdAt, lastLoginAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uid, name, email, mockHashedPass, department || 'IT Operations', role, provider, now, now]
      );

      // Sync into employees catalog
      const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      await db.query(
        'INSERT INTO employees (id, name, email, department, role, avatar) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [uid, name, email, department || 'IT Operations', 'Employee', avatar]
      );

      const createdUsers = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      foundUser = createdUsers[0];
    } else {
      foundUser = users[0];
      await db.query('UPDATE users SET lastLoginAt = ? WHERE uid = ?', [now, foundUser.uid]);
    }

    const token = jwt.sign({ uid: foundUser.uid, role: foundUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const avatar = foundUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    res.json({
      token,
      user: {
        uid: foundUser.uid,
        name: foundUser.name,
        email: foundUser.email,
        department: foundUser.department,
        role: foundUser.role,
        avatar,
        provider: foundUser.provider
      }
    });
  } catch (error) {
    console.error('Google SSO Route Error:', error);
    res.status(500).json({ error: 'Internal server error occurred.' });
  }
});

export default router;
