# vltweb-server

Lightweight Express server with Mongoose for storing images. Endpoints:

- `GET /api/images` — list images
- `GET /api/images/:id` — get image
- `POST /api/images` — create image (JSON body)
- `PUT /api/images/:id` — update image
- `DELETE /api/images/:id` — delete image

Setup:

1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. From `server` run:

```
npm install
npm run dev
```

Allow CORS from your frontend (the server uses `cors()` by default).

Frontend usage example (replace localStorage code):

```js
// fetch all
const res = await fetch("http://localhost:4000/api/images");
const images = await res.json();

// create
await fetch("http://localhost:4000/api/images", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, url, description }),
});
```
