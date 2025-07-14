// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  thumbnailUrl: String,
  category: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },

  // <-- this is the important bit:
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Video", videoSchema);
