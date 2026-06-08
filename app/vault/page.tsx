import type { Metadata } from "next";
import { GalleryPage } from "@/components/gallery/gallery-page";
import { VAULT_CONFIG } from "@/lib/gallery-config";

export const metadata: Metadata = {
  title: "Le Coffre",
  robots: { index: false, follow: false },
};

export default function VaultPage() {
  return (
    <GalleryPage config={VAULT_CONFIG} backHref="/photos" />
  );
}
