const HEIC_EXTENSIONS = /\.(heic|heif)$/i;

const HEIC_MIME_TYPES = new Set(["image/heic", "image/heif"]);

export function isHeicImage(name: string, mimeType?: string): boolean {
  if (HEIC_EXTENSIONS.test(name)) return true;
  return mimeType ? HEIC_MIME_TYPES.has(mimeType) : false;
}

export function toJpegFilename(filename: string): string {
  return filename.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
}
