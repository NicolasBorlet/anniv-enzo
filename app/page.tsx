import { GalleryPage } from "@/components/gallery/gallery-page";
import { GALLERY_CONFIG } from "@/lib/gallery-config";

export default function Home() {
  return <GalleryPage config={GALLERY_CONFIG} showEasterEgg />;
}
