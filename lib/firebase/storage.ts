import {
  ref,
  list,
  getDownloadURL,
  uploadBytes,
  getMetadata,
  type StorageReference,
} from "firebase/storage";
import { normalizeImageFileForUpload } from "@/lib/client/normalize-image-upload";
import { getIdToken } from "./auth";
import { getFirebaseStorage } from "./client";
import {
  GALLERY_PAGE_SIZE,
  type GalleryImage,
  type GalleryImagePage,
  type StorageFolder,
} from "@/lib/types";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|avif|heic|heif)$/i;

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.test(name);
}

async function collectSortedImageRefs(
  folder: StorageFolder,
): Promise<StorageReference[]> {
  const storage = getFirebaseStorage();
  const folderRef = ref(storage, folder);
  const items: StorageReference[] = [];
  let pageToken: string | undefined;

  do {
    const result = await list(folderRef, { maxResults: 1000, pageToken });
    items.push(...result.items.filter((item) => isImageFile(item.name)));
    pageToken = result.nextPageToken;
  } while (pageToken);

  return items.sort((a, b) => b.name.localeCompare(a.name));
}

async function refToGalleryImage(item: StorageReference): Promise<GalleryImage> {
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
  };
}

export async function listSortedImageRefs(
  folder: StorageFolder,
): Promise<StorageReference[]> {
  return collectSortedImageRefs(folder);
}

export async function loadImagePage(
  refs: StorageReference[],
  offset: number,
  pageSize = GALLERY_PAGE_SIZE,
): Promise<GalleryImagePage> {
  const pageRefs = refs.slice(offset, offset + pageSize);
  const images = await Promise.all(pageRefs.map(refToGalleryImage));

  return {
    images,
    hasMore: offset + pageSize < refs.length,
    total: refs.length,
  };
}

export async function loadAllImageDetails(
  refs: StorageReference[],
): Promise<GalleryImage[]> {
  const images = await Promise.all(refs.map(refToGalleryImage));

  return images.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

/** @deprecated Prefer listSortedImageRefs + loadImagePage for pagination */
export async function listImages(folder: StorageFolder): Promise<GalleryImage[]> {
  const refs = await collectSortedImageRefs(folder);
  return loadAllImageDetails(refs);
}

export async function uploadImage(
  folder: StorageFolder,
  file: File,
): Promise<GalleryImage> {
  const normalizedFile = await normalizeImageFileForUpload(file);

  if (folder === "gallery") {
    return uploadGalleryImage(normalizedFile);
  }

  const storage = getFirebaseStorage();
  const safeName = `${Date.now()}-${normalizedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fileRef = ref(storage, `${folder}/${safeName}`);

  const snapshot = await uploadBytes(fileRef, normalizedFile, {
    contentType: normalizedFile.type,
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

async function uploadGalleryImage(file: File): Promise<GalleryImage> {
  const token = await getIdToken();
  if (!token) {
    throw new Error("Non authentifié");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/photos/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Impossible d'envoyer la photo");
  }

  return (await response.json()) as GalleryImage;
}

export async function deleteImage(path: string): Promise<void> {
  const token = await getIdToken();
  if (!token) {
    throw new Error("Non authentifié");
  }

  const response = await fetch("/api/photos/delete", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    throw new Error("Impossible de supprimer la photo");
  }
}
