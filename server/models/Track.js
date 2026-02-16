const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, default: "" },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Track", TrackSchema);
