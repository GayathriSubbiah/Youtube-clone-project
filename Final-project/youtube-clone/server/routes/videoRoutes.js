const express = require("express");
const multer = require("multer");
const authenticate = require("../middleware/auth");
const router = express.Router();
const Video = require("../models/Video");
const Channel = require("../models/Channel");
const path = require("path");
const fs = require("fs");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ POST /api/videos/upload — must be above any /:id route
router.post(
  "/upload",
  authenticate,
  upload.fields([
    { name: "video",     maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, category, channelId } = req.body;
      const videoFile = req.files.video?.[0];
      const thumbFile = req.files.thumbnail?.[0];

      if (!videoFile || !thumbFile || !channelId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 1) Create the Video document
      const video = await Video.create({
        title,
        description,
        category,
        url: `/uploads/${videoFile.filename}`,
        thumbnailUrl: `/uploads/${thumbFile.filename}`,
        channelId,
        uploadedBy: req.user.userId,
      });

      // 2) Add the video _id_ into the Channel.videos array
      await Channel.findByIdAndUpdate(channelId, {
        $push: { videos: video._id }
      });

      res.status(201).json(video);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to upload video" });
    }
  }
);


// ✅ POST /api/videos — single video file upload (older variant)
router.post("/", authenticate, upload.single("video"), async (req, res) => {
  try {
    const { title, channelId, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const video = new Video({
      title,
      description,
      category,
      url: `/upload/${req.file.filename}`,
      channelId,
      uploadedBy: req.user.id,
    });

    await video.save();
    res.status(201).json(video);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload video" });
  }
});

// ✅ GET /api/videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find({});
    res.json(videos);
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ GET /api/videos/search?q=term&category=Category
router.get("/search", async (req, res) => {
  try {
    const { q, category } = req.query;
    const query = {
      title: { $regex: q, $options: "i" }
    };

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(category, "i") };
    }

    const videos = await Video.find(query);
    res.json(videos);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ✅ GET /api/videos/suggestions?q=term
router.get("/suggestions", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json([]);
  }

  try {
    const suggestions = await Video.find({
      title: { $regex: query, $options: "i" },
    }).limit(5);
    res.json(suggestions);
  } catch (err) {
    console.error("Suggestions fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET /api/videos/category/:category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const videos = await Video.find({
      category: { $regex: new RegExp(category, "i") }
    });
    res.json(videos);
  } catch (err) {
    console.error("Category fetch error:", err);
    res.status(500).json({ error: "Failed to fetch videos by category" });
  }
});

// ✅ GET /api/videos/:id
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).lean();
    if (!video) return res.status(404).json({ error: "Video not found" });

    const channel = await Channel.findById(video.channelId).lean();
    if (channel) {
      video.channelName = channel.channelName;
      video.channelId = channel._id;
    }

    res.json(video);
  } catch (err) {
    console.error("Get video error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /api/videos/:id/like
router.post("/:id/like", async (req, res) => {
  try {
    const updated = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Failed to like video" });
  }
});

// ✅ POST /api/videos/:id/dislike
router.post("/:id/dislike", async (req, res) => {
  try {
    const updated = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: 1 } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Dislike error:", err);
    res.status(500).json({ error: "Failed to dislike video" });
  }
});
// GET a video by ID
router.get("/:videoId", async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

// PUT update video details
router.put("/:videoId", authenticate, async (req, res) => {
  const { title, description } = req.body;
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    // Optional: Check if the current user is the owner
    // if (video.owner.toString() !== req.user.id) {
    //   return res.status(403).json({ error: "Not authorized to edit this video" });
    // }

    video.title = title || video.title;
    video.description = description || video.description;

    await video.save();
    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update video" });
  }
});


module.exports = router;
