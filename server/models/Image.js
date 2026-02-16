const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  title: { type: String },
  // support single `url` for older records and `urls` array for gallery items
  url: { type: String },
  urls: { type: [String], default: [] },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", ImageSchema);
