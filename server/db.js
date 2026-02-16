const mongoose = require("mongoose");

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  console.log("Connecting to MongoDB...");
  cachedConnection = await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB connected successfully");
  return cachedConnection;
}

module.exports = connectToDatabase;
