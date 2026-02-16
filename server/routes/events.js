const express = require("express");
const router = express.Router();
const connectToDatabase = require("../db");

// Ensure DB connection for SSE (though not directly using models, helps server stability)
router.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    next(); // Continue even if DB fails for SSE
  }
});

// Simple in-memory list of SSE clients
const clients = new Set();

router.get("/", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();

  const client = res;
  clients.add(client);

  // send a comment to keep connection alive
  res.write(": connected\n\n");

  req.on("close", () => {
    clients.delete(client);
  });
});

function broadcast(eventName, payload) {
  const data =
    `event: ${eventName}\n` + `data: ${JSON.stringify(payload || {})}\n\n`;
  for (const res of clients) {
    try {
      res.write(data);
    } catch (e) {
      // ignore
    }
  }
}

router.post("/notify", express.json(), (req, res) => {
  try {
    const { event = "message", payload } = req.body || {};
    broadcast(event, payload);
    res.json({ ok: true });
  } catch (err) {
    console.error("SSE notify error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
