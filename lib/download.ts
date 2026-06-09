import JSZip from "jszip";
import { getBytes, ref } from "firebase/storage";
import { getFirebaseStorage } from "./firebase/client";
import type { GalleryImage } from "./types";

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
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

async function fetchImageBlob(image: GalleryImage): Promise<Blob> {
  const bytes = await getBytes(ref(getFirebaseStorage(), image.id));
  return new Blob([bytes]);
}

export async function downloadImage(image: GalleryImage): Promise<void> {
  try {
    const blob = await fetchImageBlob(image);
    triggerBlobDownload(blob, image.name);
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
  triggerBlobDownload(zipBlob, `${archiveName}.zip`);
}
