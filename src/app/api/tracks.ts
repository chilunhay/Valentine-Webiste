const API_URL = (import.meta.env.VITE_API_URL as string) || "";

export interface Track {
  _id?: string;
  title: string;
  artist: string;
  url: string;
}

export async function fetchTracks(): Promise<Track[]> {
  const res = await fetch(`${API_URL}/api/tracks`);
  if (!res.ok) throw new Error("Failed to fetch tracks");
  return res.json();
}

export async function bulkReplaceTracks(
  items: Track[],
  deletedUrls: string[] = [],
) {
  const res = await fetch(`${API_URL}/api/tracks/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, deletedUrls }),
  });
  if (!res.ok) throw new Error("Failed to save tracks");
  return res.json();
}
