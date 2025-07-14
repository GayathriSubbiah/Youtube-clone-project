const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require("../middleware/auth");

const router = express.Router();

// Hardcoded secret to match backend config
const JWT_SECRET = "yourSecretKeyHere";

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, avatar });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
  { userId: user._id, username: user.username }, // ✅ userId here
  'yourSecretKeyHere',
  { expiresIn: '3h' }
);

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("_id username email");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
