import { isHeicImage, toJpegFilename } from "@/lib/image-formats";

export async function normalizeImageFileForUpload(file: File): Promise<File> {
  if (!isHeicImage(file.name, file.type)) {
    return file;
  }

  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.85,
  });
  const jpegBlob = Array.isArray(result) ? result[0] : result;

  return new File([jpegBlob], toJpegFilename(file.name), {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
