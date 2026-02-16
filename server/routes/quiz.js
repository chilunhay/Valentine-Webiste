const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
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

router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: 1 });
    res.json(quizzes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/bulk", async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Expected items array" });
    }

    // Replace all quizzes
    await Quiz.deleteMany({});
    const inserted = await Quiz.insertMany(
      items.map((it) => ({
        question: it.question,
        answer: it.answer,
        options: it.options || [],
        hint: it.hint || "",
        correctResponse: it.correctResponse,
        incorrectResponse: it.incorrectResponse,
      })),
    );

    res.json(inserted);
  } catch (e) {
    console.error("Bulk quizzes error:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
