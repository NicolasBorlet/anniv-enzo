import JSZip from "jszip";
import { getBytes, ref } from "firebase/storage";
import { getFirebaseStorage } from "./firebase/client";
import { isHeicImage, toJpegFilename } from "./image-formats";
import type { GalleryImage } from "./types";

function mimeTypeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    avif: "image/avif",
  };
  return map[ext ?? ""] ?? "image/jpeg";
}

function triggerUrlDownload(image: GalleryImage) {
  const anchor = document.createElement("a");
  anchor.href = image.url;
  anchor.download = image.name;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

async function fetchImageBlob(image: GalleryImage): Promise<Blob> {
  const bytes = await getBytes(ref(getFirebaseStorage(), image.id));
  return new Blob([bytes], { type: mimeTypeFromFilename(image.name) });
}

async function prepareShareableImage(
  image: GalleryImage,
): Promise<{ blob: Blob; filename: string }> {
  let blob = await fetchImageBlob(image);
  let filename = image.name;

  if (isHeicImage(image.name)) {
    try {
      const heic2any = (await import("heic2any")).default;
      const result = await heic2any({
        blob,
        toType: "image/jpeg",
        quality: 0.92,
      });
      blob = Array.isArray(result) ? result[0] : result;
      filename = toJpegFilename(image.name);
    } catch {
      // Keep original HEIC if conversion fails.
    }
  }

  return { blob, filename };
}

async function saveBlob(blob: Blob, filename: string): Promise<void> {
  const mimeType = blob.type || mimeTypeFromFilename(filename);
  const file = new File([blob], filename, { type: mimeType });

  if (
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
    }
  }

  triggerBlobDownload(blob, filename);
}

export async function downloadImage(image: GalleryImage): Promise<void> {
  try {
    const { blob, filename } = await prepareShareableImage(image);
    await saveBlob(blob, filename);
  } catch {
    triggerUrlDownload(image);
  }
}

export async function downloadAllImages(
  images: GalleryImage[],
  archiveName: string,
): Promise<void> {
  if (images.length === 0) return;

  const zip = new JSZip();
  const usedNames = new Set<string>();

  await Promise.all(
    images.map(async (image) => {
      const blob = await fetchImageBlob(image);
      let filename = image.name;

      if (usedNames.has(filename)) {
        const dotIndex = filename.lastIndexOf(".");
        const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
        const ext = dotIndex > 0 ? filename.slice(dotIndex) : "";
        let counter = 2;
        while (usedNames.has(`${base}-${counter}${ext}`)) {
          counter += 1;
        }
        filename = `${base}-${counter}${ext}`;
      }

      usedNames.add(filename);
      zip.file(filename, blob);
    }),
  );

  const zipBlob = await zip.generateAsync({ type: "blob" });
  await saveBlob(zipBlob, `${archiveName}.zip`);
}
