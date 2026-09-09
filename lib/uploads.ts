import path from "path";

// Directory where uploaded product images are stored.
// Locally: ./uploads. In production set UPLOADS_DIR to a path on a persistent
// volume (e.g. /data/uploads) so images survive restarts and redeploys.
export function uploadsDir(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
}

// Public URL used to reference an uploaded file. Served by /api/uploads/[file],
// so it works the same locally and in production regardless of storage path.
export function uploadUrl(filename: string): string {
  return `/api/uploads/${filename}`;
}
