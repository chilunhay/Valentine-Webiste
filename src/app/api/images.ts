const API_BASE = (import.meta.env.VITE_API_URL as string) || "";

export interface ImagePayload {
  title?: string;
  description?: string;
  urls?: string[];
  metadata?: any;
  createdAt?: string;
}

export async function fetchImages() {
  const res = await fetch(`${API_BASE}/api/images`);
  if (!res.ok) throw new Error("Failed to fetch images");
  return (await res.json()) as Array<any>;
}

export async function createImage(payload: ImagePayload) {
  const res = await fetch(`${API_BASE}/api/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create image");
  return await res.json();
}

export async function updateImage(id: string, payload: ImagePayload) {
  const res = await fetch(`${API_BASE}/api/images/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update image");
  return await res.json();
}

export async function deleteImage(id: string) {
  const res = await fetch(`${API_BASE}/api/images/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete image");
  return await res.json();
}

export async function bulkReplaceImages(
  items: ImagePayload[],
  deletedUrls: string[] = [],
) {
  const res = await fetch(`${API_BASE}/api/images/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, deletedUrls }),
  });
  if (!res.ok) throw new Error("Failed to bulk replace images");
  return await res.json();
}
