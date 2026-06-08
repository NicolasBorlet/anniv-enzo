import type { Metadata } from "next";
import { GalleryPage } from "@/components/gallery/gallery-page";
import { GALLERY_CONFIG } from "@/lib/gallery-config";

export const metadata: Metadata = {
  title: "Photos",
};

export default function PhotosPage() {
  return (
    <GalleryPage config={GALLERY_CONFIG} showEasterEgg backHref="/" />
  );
}
