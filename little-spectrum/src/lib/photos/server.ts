import "server-only";
import sharp from "sharp";
import { createServiceClient } from "@/lib/supabase/server";

export const PHOTO_BUCKET = "photos";
export const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024;
export const TARGET_BYTES = 500 * 1024;
export const MAX_EDGE = 1600;

export class PhotoError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function sniff(buffer: Buffer): "jpeg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

// Validates real image content, resizes, re-encodes as JPEG, and drops every bit of metadata.
export async function processImage(buffer: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  if (buffer.length > MAX_UPLOAD_BYTES) throw new PhotoError("That photo is too large. Try one under 2 MB.", 413);
  const kind = sniff(buffer);
  if (!kind) throw new PhotoError("That file is not a JPEG, PNG, or WebP image.", 415);
  let meta;
  try {
    meta = await sharp(buffer, { failOn: "error" }).metadata();
  } catch {
    throw new PhotoError("We could not read that image. Try a different photo.", 415);
  }
  if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) {
    throw new PhotoError("That file is not a JPEG, PNG, or WebP image.", 415);
  }
  if ((meta.width ?? 0) * (meta.height ?? 0) > 40_000_000) throw new PhotoError("That image has too many pixels.", 413);
  for (const quality of [82, 72, 62]) {
    const { data, info } = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    if (data.length <= TARGET_BYTES || quality === 62) return { data, width: info.width, height: info.height };
  }
  throw new PhotoError("Could not compress that photo.", 500);
}

// Maps a storage provider failure to something a person can act on.
export function storageFailure(message: string): PhotoError {
  const text = message.toLowerCase();
  if (text.includes("quota") || text.includes("exceeded") || text.includes("limit")) {
    return new PhotoError("Photo storage is full for this project. Delete some old photos to make room.", 507);
  }
  if (text.includes("bucket") && text.includes("not found")) {
    return new PhotoError("The photos bucket is missing. Run the database migration on this project.", 500);
  }
  return new PhotoError("Could not store the photo. Please try again.", 502);
}

export async function uploadPhotoFile(path: string, data: Buffer): Promise<void> {
  const { error } = await createServiceClient().storage.from(PHOTO_BUCKET).upload(path, data, {
    contentType: "image/jpeg",
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) throw storageFailure(error.message);
}

export async function removePhotoFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await createServiceClient().storage.from(PHOTO_BUCKET).remove(paths);
}

export async function signedPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (paths.length === 0) return result;
  const { data } = await createServiceClient().storage.from(PHOTO_BUCKET).createSignedUrls(paths, 60 * 60);
  for (const entry of data ?? []) if (entry.signedUrl && entry.path) result.set(entry.path, entry.signedUrl);
  return result;
}

// Removes this user's photos in a session that never became a submission.
export async function cleanupOrphanPhotos(sessionId: string, userId: string): Promise<void> {
  const db = createServiceClient();
  const [{ data: photos }, { data: submissions }] = await Promise.all([
    db.from("photos").select("id, storage_path").eq("session_id", sessionId).eq("user_id", userId),
    db.from("submissions").select("payload").eq("session_id", sessionId).eq("user_id", userId),
  ]);
  const used = new Set((submissions ?? []).map((s) => (s.payload as { photoId?: string })?.photoId));
  const orphans = (photos ?? []).filter((p) => !used.has(p.id as string));
  if (orphans.length === 0) return;
  await removePhotoFiles(orphans.map((p) => p.storage_path as string));
  await db
    .from("photos")
    .delete()
    .in(
      "id",
      orphans.map((p) => p.id),
    );
}
