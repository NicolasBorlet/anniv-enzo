import type { GalleryConfig } from "./types";

export const GALLERY_CONFIG: GalleryConfig = {
  folder: "gallery",
  title: "Anniv Enzo",
  subtitle: "Les plus beaux souvenirs de la soirée",
  allowUpload: true,
  adminOnlyUpload: true,
  emptyMessage: "Aucune photo pour le moment.",
};

export const GUEST_CONFIG: GalleryConfig = {
  folder: "guest",
  title: "Partager une photo",
  subtitle: "Envoyez vos souvenirs de la soirée",
  allowUpload: true,
  emptyMessage:
    "Aucune photo partagée pour le moment — soyez le premier à en ajouter !",
};

/** @deprecated Use GUEST_CONFIG */
export const UPLOAD_CONFIG = GUEST_CONFIG;

export const VAULT_CONFIG: GalleryConfig = {
  folder: "special",
  title: "Le Coffre",
  subtitle: "Des images un peu plus secrètes…",
  allowUpload: false,
  emptyMessage: "Le coffre est vide pour l'instant.",
};
