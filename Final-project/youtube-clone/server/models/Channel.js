// server/models/Channel.js
const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true, trim: true },
  handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar: { type: String, default: "" },
  description: { type: String, default: "", trim: true },
  subscribers: { type: Number, default: 0 },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  createdAt: { type: Date, default: Date.now },
});

// Must export the model itself:
module.exports = mongoose.model("Channel", ChannelSchema);
