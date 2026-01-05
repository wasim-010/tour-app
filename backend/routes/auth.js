// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const router = express.Router();
const jwtSecret = config.jwtSecret;

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    const passwordHash = bcrypt.hashSync(password, 10);
    try {
        const result = await db.runAsync(`INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`, [username, email, passwordHash]);
        res.status(201).json({ userId: result.lastID });
    } catch (error) { res.status(409).json({ message: 'Username or email already exists.' }); }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    try {
        const user = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user.user_id, email: user.email }, jwtSecret, { expiresIn: '24h' });
        res.status(200).json({ token, user: { userId: user.user_id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;