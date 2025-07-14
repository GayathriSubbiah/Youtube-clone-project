const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); // ✅ Logging

// Models
const User = require('./models/User');
const Video = require('./models/Video');
const Comment = require('./models/Comment');

const app = express();
const PORT = 3000;

// ✅ Set fixed values instead of using .env
const MONGO_URI = 'mongodb://localhost:27017/youtube_clone';
const JWT_SECRET = 'yourSecretKeyHere';

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ✅ Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/videos", express.static(path.join(__dirname, "public/videos")));

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

// ✅ Auth APIs
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: '3h' }
  );

  res.json({ token, user });
});

app.get('/api/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.json(user);
});

// ✅ Search API
app.get("/api/videos/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Query missing" });

  try {
    const videos = await Video.find({
      title: { $regex: q, $options: "i" }
    });
    res.json(videos);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Import Routes
app.use("/api", require("./routes/auth"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/videos", require("./routes/videoRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/channels", require("./routes/channelRoutes"));

// ✅ Start server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
