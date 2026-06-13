import sharp from "sharp";
import { isHeicImage, toJpegFilename } from "@/lib/image-formats";

export async function normalizeImageForStorage(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  if (!isHeicImage(filename, mimeType)) {
    return { buffer, contentType: mimeType, filename };
  }

  const jpegBuffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();

  return {
    buffer: jpegBuffer,
    contentType: "image/jpeg",
    filename: toJpegFilename(filename),
  };
}
