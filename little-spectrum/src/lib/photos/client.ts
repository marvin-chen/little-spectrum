// Browser-side resize and re-encode. Drawing to a canvas drops EXIF, including location.

export const CLIENT_MAX_EDGE = 1600;
const CLIENT_TARGET_BYTES = 500 * 1024;

export class UnsupportedImageError extends Error {}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new UnsupportedImageError("We could not read that image. Try a JPEG, PNG, or WebP."));
      };
      image.src = url;
    });
  }
}

export async function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const source = await decode(file);
  const sourceWidth = "naturalWidth" in source ? source.naturalWidth : source.width;
  const sourceHeight = "naturalHeight" in source ? source.naturalHeight : source.height;
  if (!sourceWidth || !sourceHeight) throw new UnsupportedImageError("We could not read that image. Try a JPEG, PNG, or WebP.");
  const scale = Math.min(1, CLIENT_MAX_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new UnsupportedImageError("Your browser could not process the image.");
  context.drawImage(source, 0, 0, width, height);
  if ("close" in source) source.close();
  for (const quality of [0.85, 0.75, 0.65, 0.55]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new UnsupportedImageError("Your browser could not encode the image.");
    if (blob.size <= CLIENT_TARGET_BYTES || quality === 0.55) return { blob, width, height };
  }
  throw new UnsupportedImageError("Could not compress that photo.");
}
