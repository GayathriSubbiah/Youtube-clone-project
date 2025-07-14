const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Channel = require('../models/Channel');
const User = require('../models/User');

// Get all videos
router.get('/videos', async (req, res) => {
  const videos = await Video.find();
  res.json(videos);
});

// Get single video
router.get('/videos/:id', async (req, res) => {
  const video = await Video.findById(req.params.id);
  res.json(video);
});

// Post comment to video
router.post('/videos/:id/comments', async (req, res) => {
  const video = await Video.findById(req.params.id);
  const comment = {
    _id: Date.now().toString(),
    text: req.body.text
  };
  video.comments.push(comment);
  await video.save();
  res.json(comment);
});

// Get channel
router.get('/channels/:id', async (req, res) => {
  const channel = await Channel.findById(req.params.id).populate('videos');
  res.json(channel);
});

module.exports = router;