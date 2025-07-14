const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
  content: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
