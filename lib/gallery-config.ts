import type { GalleryConfig } from "./types";

export const GALLERY_CONFIG: GalleryConfig = {
  folder: "gallery",
  title: "Anniv Enzo",
  subtitle: "Partagez vos plus beaux souvenirs de la fête",
  allowUpload: true,
  emptyMessage: "Aucune photo pour le moment — soyez le premier à en ajouter !",
};

export const VAULT_CONFIG: GalleryConfig = {
  folder: "special",
  title: "Le Coffre",
  subtitle: "Des images un peu plus secrètes…",
  allowUpload: false,
  emptyMessage: "Le coffre est vide pour l'instant.",
};
