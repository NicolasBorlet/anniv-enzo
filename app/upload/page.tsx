import type { Metadata } from "next";
import { GalleryPage } from "@/components/gallery/gallery-page";
import { UPLOAD_CONFIG } from "@/lib/gallery-config";

export const metadata: Metadata = {
  title: "Partager une photo",
};

export default function UploadPage() {
  return <GalleryPage config={UPLOAD_CONFIG} backHref="/" />;
}
