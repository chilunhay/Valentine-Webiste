const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  options: { type: [String], default: [] },
  hint: { type: String, default: "" },
  correctResponse: { type: String, default: "Chính xác! Bạn tuyệt vời quá ❤️" },
  incorrectResponse: {
    type: String,
    default: "Sai rồi, thử lại nhé bạn ơi 😅",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quiz", QuizSchema);
