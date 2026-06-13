export type StorageFolder = "gallery" | "special" | "guest";

export const GALLERY_PAGE_SIZE = 10;

export type GalleryImage = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  size: number;
};

export type GalleryImagePage = {
  images: GalleryImage[];
  hasMore: boolean;
  total: number;
};

export type GalleryConfig = {
  folder: StorageFolder;
  title: string;
  subtitle: string;
  allowUpload: boolean;
  /** Upload réservé aux super admins connectés */
  adminOnlyUpload?: boolean;
  emptyMessage: string;
};
