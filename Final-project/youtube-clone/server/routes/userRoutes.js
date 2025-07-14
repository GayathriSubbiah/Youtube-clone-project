const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User"); // adjust path as needed
const authenticate = require("../middleware/auth");

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.post("/avatar", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.userId, { avatar: avatarUrl });
    res.json({ avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload avatar." });
  }
});

// GET /api/users/me - Get current logged-in user
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in /api/users/me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
