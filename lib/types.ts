export type StorageFolder = "gallery" | "special" | "guest";

export type GalleryImage = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  size: number;
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
