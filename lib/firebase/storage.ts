import {
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  getMetadata,
} from "firebase/storage";
import { getFirebaseStorage } from "./client";
import type { GalleryImage, StorageFolder } from "@/lib/types";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|avif|heic|heif)$/i;

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.test(name);
}

export async function listImages(folder: StorageFolder): Promise<GalleryImage[]> {
  const storage = getFirebaseStorage();
  const folderRef = ref(storage, folder);
  const result = await listAll(folderRef);

  const imageItems = result.items.filter((item) => isImageFile(item.name));

  const images = await Promise.all(
    imageItems.map(async (item) => {
      const [url, metadata] = await Promise.all([
        getDownloadURL(item),
        getMetadata(item),
      ]);

      return {
        id: item.fullPath,
        name: item.name,
        url,
        uploadedAt: metadata.timeCreated,
        size: metadata.size,
      } satisfies GalleryImage;
    }),
  );

  return images.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export async function uploadImage(
  folder: StorageFolder,
  file: File,
): Promise<GalleryImage> {
  const storage = getFirebaseStorage();
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fileRef = ref(storage, `${folder}/${safeName}`);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
  });

  const [url, metadata] = await Promise.all([
    getDownloadURL(snapshot.ref),
    getMetadata(snapshot.ref),
  ]);

  return {
    id: snapshot.ref.fullPath,
    name: snapshot.ref.name,
    url,
    uploadedAt: metadata.timeCreated,
    size: metadata.size,
  };
}
