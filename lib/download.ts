import JSZip from "jszip";
import type { GalleryImage } from "./types";

async function fetchImageBlob(image: GalleryImage): Promise<Blob> {
  const response = await fetch(
    `/api/photos/download?path=${encodeURIComponent(image.id)}`,
  );
  if (!response.ok) {
    throw new Error(`Échec du téléchargement (${response.status})`);
  }
  return response.blob();
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadImage(image: GalleryImage): Promise<void> {
  const blob = await fetchImageBlob(image);
  triggerDownload(blob, image.name);
}

export async function downloadAllImages(
  images: GalleryImage[],
  archiveName: string,
): Promise<void> {
  if (images.length === 0) return;

  if (images.length === 1) {
    await downloadImage(images[0]);
    return;
  }

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
  triggerDownload(zipBlob, `${archiveName}.zip`);
}
