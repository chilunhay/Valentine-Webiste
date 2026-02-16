require("dotenv").config();
const mongoose = require("mongoose");
const Image = require("./models/Image");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vltweb";

async function run() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to Mongo for seeding");

  const samples = [
    {
      title: "Romantic Moments",
      description: "Cherishing every moment together",
      urls: [
        "https://images.unsplash.com/photo-1487035092507-28f5c8ba203e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      ],
    },
    {
      title: "Red Roses",
      description: "Classic symbol of love",
      urls: [
        "https://images.unsplash.com/photo-1732894137876-c75e9badf5e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      ],
    },
    {
      title: "Heart Balloons",
      description: "Floating with love",
      urls: [
        "https://images.unsplash.com/photo-1615663058740-1ef358ca72a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      ],
    },
    {
      title: "Candlelight Dinner",
      description: "A romantic evening",
      urls: [
        "https://images.unsplash.com/photo-1614680889829-9b2d25a71be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      ],
    },
  ];

  try {
    // only seed if collection empty
    const count = await Image.countDocuments();
    if (count === 0) {
      const inserted = await Image.insertMany(samples);
      console.log("Inserted sample images:", inserted.length);
    } else {
      console.log(
        "Collection not empty — skipping seed (documents:",
        count,
            // notify server (so SSE clients can refresh)
            try {
              const fetch = require('node-fetch');
              const api = process.env.API_BASE || 'http://localhost:4000';
              await fetch(`${api}/api/events/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'seed', payload: { count: inserted.length } }),
              });
              console.log('Notified server of seed event');
            } catch (e) {
              console.warn('Failed to notify server of seed event', e.message || e);
            }
        ")",
      );
    }
  } catch (e) {
    console.error("Seed error", e);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from Mongo — seed finished");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
