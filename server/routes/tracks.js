const express = require("express");
const router = express.Router();
const Track = require("../models/Track");
const { v2: cloudinary } = require("cloudinary");
const connectToDatabase = require("../db");

// Middleware to ensure database connection
router.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Helper function to extract public ID from Cloudinary URL (similar to images.js)
function extractPublicId(url) {
  try {
    const pathMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    return pathMatch ? pathMatch[1] : null;
  } catch (e) {
    return null;
  }
}

async function deleteFromCloudinary(url) {
  if (!cloudinary.config().api_key) return;
  const publicId = extractPublicId(url);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" }); // Cloudinary treats mp3 as 'video'
    } catch (e) {
      console.error("Cloudinary deletion failed:", e.message);
    }
  }
}

router.get("/", async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: 1 });
    res.json(tracks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/bulk", async (req, res) => {
  try {
    const { items, deletedUrls } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Expected items array" });
    }

    // Delete removed tracks from Cloudinary
    if (Array.isArray(deletedUrls) && deletedUrls.length > 0) {
      await Promise.all(deletedUrls.map((url) => deleteFromCloudinary(url)));
    }

    // Replace all tracks
    await Track.deleteMany({});
    const inserted = await Track.insertMany(
      items.map((it) => ({
        title: it.title || "Unknown",
        artist: it.artist || "",
        url: it.url,
      })),
    );

    res.json(inserted);
  } catch (e) {
    console.error("Bulk tracks error:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
