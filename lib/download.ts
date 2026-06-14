import { getBytes, ref } from "firebase/storage";
import { getFirebaseStorage } from "./firebase/client";
import { isHeicImage, toJpegFilename } from "./image-formats";
import type { GalleryImage } from "./types";

const BULK_FILE_DOWNLOAD_DELAY_MS = 300;

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;

  if (/Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }

  // iPad, including iPadOS reporting as Mac.
  if (/iPad/i.test(ua)) {
    return true;
  }

  return navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

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

function dedupeFilenames(
  items: { blob: Blob; filename: string }[],
): { blob: Blob; filename: string }[] {
  const usedNames = new Set<string>();

  return items.map((item) => {
    let filename = item.filename;

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
    return { blob: item.blob, filename };
  });
}

function toShareableFile(blob: Blob, filename: string): File {
  const mimeType = blob.type || mimeTypeFromFilename(filename);
  return new File([blob], filename, { type: mimeType });
}

async function saveBlob(blob: Blob, filename: string): Promise<void> {
  if (!isMobileDevice()) {
    triggerBlobDownload(blob, filename);
    return;
  }

  const file = toShareableFile(blob, filename);

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

async function saveAllBlobs(
  items: { blob: Blob; filename: string }[],
): Promise<void> {
  if (!isMobileDevice()) {
    for (let index = 0; index < items.length; index += 1) {
      const { blob, filename } = items[index];
      triggerBlobDownload(blob, filename);
      if (index < items.length - 1) {
        await delay(BULK_FILE_DOWNLOAD_DELAY_MS);
      }
    }
    return;
  }

  const files = items.map(({ blob, filename }) =>
    toShareableFile(blob, filename),
  );

  if (
    files.length > 1 &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files })
  ) {
    try {
      await navigator.share({ files, title: "Photos" });
      return;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
    }
  }

  for (const { blob, filename } of items) {
    await saveBlob(blob, filename);
  }
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
): Promise<void> {
  if (images.length === 0) return;

  if (images.length === 1) {
    await downloadImage(images[0]);
    return;
  }

  const prepared = dedupeFilenames(
    await Promise.all(images.map(prepareShareableImage)),
  );

  try {
    await saveAllBlobs(prepared);
  } catch {
    for (const image of images) {
      try {
        await downloadImage(image);
      } catch {
        triggerUrlDownload(image);
      }
    }
  }
}
