require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vltweb";

if (process.env.MONGO_URI) {
  console.log("Using MONGO_URI from environment");
} else {
  console.log("MONGO_URI not set in environment — using fallback local URI");
}

console.log("Attempting to connect to:", MONGO_URI);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB successfully.");
    try {
      await mongoose.connection.close();
      console.log("Closed connection.");
    } catch (e) {
      // ignore
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error(
      "MongoDB connection error:",
      err && err.message ? err.message : err,
    );
    process.exit(1);
  });
