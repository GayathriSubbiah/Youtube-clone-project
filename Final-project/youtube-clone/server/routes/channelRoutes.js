const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const Channel = require("../models/Channel");
const authenticate = require("../middleware/auth");

// ✅ GET the logged-in user's channel
router.get("/me", authenticate, async (req, res) => {
  try {
    const channel = await Channel.findOne({ owner: req.user.userId });
    if (!channel) return res.status(404).json({ error: "No channel found" });
    res.json(channel);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET a channel and its videos
router.get("/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const videos = await Video.find({ channelId });
    res.json({ channel, videos });
  } catch (err) {
    console.error("GET /:channelId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Create a new channel for the logged-in user
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, handle } = req.body;
    if (!name || !handle) {
      return res.status(400).json({ message: "Name and handle are required" });
    }

    const existing = await Channel.findOne({ handle });
    if (existing) return res.status(409).json({ message: "Handle already taken" });

    const channel = new Channel({
      name,
      handle: handle.toLowerCase().trim(),
      owner: req.user.userId
    });

    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    console.error("Channel creation error:", err);
    res.status(500).json({ message: "Failed to create channel" });
  }
});

// ✅ Update channel metadata
router.put("/:channelId", authenticate, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, handle, description, avatar } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    if (channel.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (name) channel.name = name;
    if (handle) channel.handle = handle.toLowerCase().trim();
    if (description) channel.description = description;
    if (avatar) channel.avatar = avatar;

    await channel.save();
    res.json(channel);
  } catch (err) {
    console.error("Channel update error:", err);
    res.status(500).json({ error: "Failed to update channel" });
  }
});

// ✅ Delete a video from a channel
router.delete("/:channelId/video/:videoId", authenticate, async (req, res) => {
  try {
    const { channelId, videoId } = req.params;
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    if (channel.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Remove from channel's videos array
    channel.videos.pull(videoId);
    await channel.save();

    // Delete the video document
    await Video.findByIdAndDelete(videoId);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

module.exports = router;
