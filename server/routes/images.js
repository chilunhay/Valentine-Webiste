const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
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

// Configure Cloudinary
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url) {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/VLTWebsite/public_id.ext
    const match = url.match(
      /\/upload\/(?:v\d+\/)?(?:.*\/)?([^\/]+)(?:\.\w+)?$/,
    );
    if (match && match[1]) {
      // Construct the full public ID with folder
      const pathMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1];
      }
    }
    return null;
  } catch (e) {
    console.error("Error extracting public ID:", e);
    return null;
  }
}

// Helper function to delete image from Cloudinary
async function deleteCloudinaryImage(url) {
  if (!cloudinary.config().api_key) {
    console.warn("Cloudinary not configured, skipping remote deletion");
    return;
  }

  try {
    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) {
      console.warn("Could not extract public ID from URL:", url);
      return;
    }

    await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary:", publicId);
  } catch (e) {
    console.error("Error deleting from Cloudinary:", e.message);
    // Don't throw - continue even if Cloudinary deletion fails
  }
}

router.get("/", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const img = await Image.findById(req.params.id);
    if (!img) return res.status(404).json({ error: "Not found" });
    res.json(img);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const img = new Image(req.body);
    await img.save();
    res.status(201).json(img);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Bulk replace all images: expect an array of image objects in body
router.post("/bulk", async (req, res) => {
  try {
    const { items, deletedUrls } = req.body;

    // Support both old and new payload formats for backward compatibility
    const imageItems = Array.isArray(req.body) ? req.body : items;
    const urlsToDelete = deletedUrls || [];

    if (!Array.isArray(imageItems))
      return res.status(400).json({ error: "Expected array" });

    // Delete specified URLs from Cloudinary
    if (Array.isArray(urlsToDelete) && urlsToDelete.length > 0) {
      await Promise.all(urlsToDelete.map((url) => deleteCloudinaryImage(url)));
    }

    // Map incoming shape to model fields
    const docs = imageItems.map((it) => ({
      title: it.title || "",
      description: it.description || "",
      // accept either `urls` array or single `url`
      urls:
        Array.isArray(it.urls) && it.urls.length > 0
          ? it.urls
          : it.url
            ? [it.url]
            : [],
      metadata: it.metadata || {},
      createdAt: it.createdAt ? new Date(it.createdAt) : undefined,
    }));

    // Replace collection atomically-ish: delete then insert
    await Image.deleteMany({});
    const inserted = await Image.insertMany(docs);
    res.json(inserted);
  } catch (e) {
    console.error("Bulk replace error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const img = await Image.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!img) return res.status(404).json({ error: "Not found" });
    res.json(img);
  } catch (e) {
    console.error("Update image error:", e);
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const img = await Image.findByIdAndDelete(req.params.id);
    if (!img) return res.status(404).json({ error: "Not found" });

    // Delete associated images from Cloudinary
    if (img.urls && Array.isArray(img.urls)) {
      await Promise.all(img.urls.map((url) => deleteCloudinaryImage(url)));
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
