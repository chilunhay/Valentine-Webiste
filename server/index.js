require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// fs and path removed: no longer writing .env.actual
const imagesRouter = require("./routes/images");
const eventsRouter = require("./routes/events");
const tracksRouter = require("./routes/tracks");
const connectToDatabase = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const connectToDatabase = require("./db");
    await connectToDatabase();
    res.json({
      status: "ok",
      database: "connected",
      env: {
        node_env: process.env.NODE_ENV,
        has_mongo: !!process.env.MONGO_URI,
        has_cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Pre-const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vltweb";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vltweb";

// Unified MongoDB Connection
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Connected to MongoDB established");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // In serverless, we might want to throw to let the function retry
    throw err;
  }
};

// Initiate connection immediately
connectDB().catch((err) => {
  console.error("Initial MongoDB connection failed:", err.message);
});

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Database connection failed", details: err.message });
  }
});

app.use("/api/images", imagesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/tracks", tracksRouter);
app.use("/api/quiz", require("./routes/quiz"));

// Export app for serverless deployment
module.exports = app;

// Only start the server if not running in Vercel environment
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  // Start server with automatic port fallback if port is in use
  const maxAttempts = 10;
  let attempt = 0;
  function startServer(port) {
    attempt += 1;
    const server = app.listen(port, () => {
      console.log(`Server listening on ${port}`);
    });

    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        console.warn(`Port ${port} in use. Trying port ${port + 1}...`);
        try {
          server.close();
        } catch (_) {}
        if (attempt < maxAttempts) {
          startServer(port + 1);
        } else {
          console.error("Could not find free port after multiple attempts.");
          process.exit(1);
        }
      } else {
        console.error("Server error", err);
        process.exit(1);
      }
    });
  }

  startServer(PORT);
}
