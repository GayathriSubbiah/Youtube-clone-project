const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// GET all comments for a video
router.get("/:videoId", async (req, res) => {
  const comments = await Comment.find({ videoId: req.params.videoId });
  res.json(comments);
});

// POST a new comment
router.post("/:videoId", async (req, res) => {
  const newComment = new Comment({ videoId: req.params.videoId, content: req.body.content });
  await newComment.save();
  res.json(newComment);
});

// PUT edit comment
router.put("/:commentId", async (req, res) => {
  const updated = await Comment.findByIdAndUpdate(req.params.commentId, { content: req.body.content }, { new: true });
  res.json(updated);
});

// DELETE a comment
router.delete("/:commentId", async (req, res) => {
  await Comment.findByIdAndDelete(req.params.commentId);
  res.json({ message: "Deleted" });
});

module.exports = router;
