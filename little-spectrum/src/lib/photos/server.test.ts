import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createServiceClient: () => ({}) }));
vi.mock("server-only", () => ({}));

const { MAX_UPLOAD_BYTES, PhotoError, processImage, storageFailure, TARGET_BYTES } = await import("./server");

describe("processImage", () => {
  it("rejects files that are not images with a useful status", async () => {
    await expect(processImage(Buffer.from("hello, this is text"))).rejects.toMatchObject({ status: 415 });
    const fakeJpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(64, 1)]);
    await expect(processImage(fakeJpeg)).rejects.toMatchObject({ status: 415 });
  });

  it("rejects oversized uploads before decoding", async () => {
    await expect(processImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1))).rejects.toMatchObject({ status: 413 });
  });

  it("resizes, re-encodes as JPEG under the target size, and drops metadata", async () => {
    const source = await sharp({
      create: { width: 3000, height: 2000, channels: 3, background: { r: 200, g: 120, b: 80 } },
    })
      .withMetadata({ exif: { IFD0: { ImageDescription: "secret location" } } })
      .png()
      .toBuffer();
    const out = await processImage(source);
    expect(out.width).toBe(1600);
    expect(out.height).toBe(1067);
    expect(out.data.length).toBeLessThanOrEqual(TARGET_BYTES);
    const meta = await sharp(out.data).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.exif).toBeUndefined();
  });
});

describe("storageFailure", () => {
  it.each([
    ["Storage quota exceeded", 507, /full/],
    ["Bucket not found", 500, /migration/],
    ["connect ECONNRESET", 502, /try again/],
  ])("maps %j to status %i", (message, status, text) => {
    const error = storageFailure(message);
    expect(error).toBeInstanceOf(PhotoError);
    expect(error.status).toBe(status);
    expect(error.message).toMatch(text);
  });
});
